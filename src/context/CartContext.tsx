/**
 * The shared bag, for every screen.
 *
 * ---------------------------------------------------------------------------
 * TWO MODES, LIKE THE WEBSITE
 * ---------------------------------------------------------------------------
 * Signed out → a guest bag in AsyncStorage (key hefa.cart.v1, the same key
 * the website uses in localStorage, so the convention is shared). Works
 * offline and survives app restarts.
 *
 * Signed in → the server bag, through the API. The server re-prices every
 * line, so the phone and the website always agree.
 *
 * On sign-in the guest lines move across one at a time through POST
 * /api/cart/items — the same rule as the website's mergeGuestCart. One at a
 * time reuses the server's validation (sold-out checks, quantity caps)
 * instead of duplicating it. A bad line is skipped, the rest still cross.
 *
 * ---------------------------------------------------------------------------
 * WHY A PROVIDER
 * ---------------------------------------------------------------------------
 * Same reason as AuthContext: the bag count on the home screen, the product
 * screen's Add button and the cart screen must never disagree. One shared
 * answer, read through useCart().
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/context/AuthContext';
import {
  EMPTY_CART,
  addCartItem,
  clearCart as apiClearCart,
  fetchCart,
  removeCartItem as apiRemoveCartItem,
  updateCartItemQuantity as apiUpdateQuantity,
  type AddItemInput,
  type Cart,
} from '@/lib/cart-api';
import { getAllProducts, getProductById } from '@/lib/products';

const STORAGE_KEY = 'hefa.cart.v1';
const MAX_QUANTITY = 10;

interface GuestLine {
  id: string;
  productId: string;
  color: string;
  size: string;
  quantity: number;
}

function lineId(productId: string, color: string, size: string): string {
  return `${productId}::${color}::${size}`;
}

function clampQuantity(value: number): number {
  if (Number.isNaN(value)) return 1;
  return Math.min(Math.max(Math.round(value), 1), MAX_QUANTITY);
}

interface CartContextValue extends Cart {
  /** True while the bag is loading or saving. Screens show a spinner. */
  isLoading: boolean;
  /** The last failure, already worded for a customer. Null when all is well. */
  error: string | null;
  /** True when the bag lives on this device only (signed out). */
  isGuest: boolean;
  addItem: (input: AddItemInput) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Turn guest lines into a priced Cart, dropping unknown or sold-out items. */
async function buildGuestCart(lines: GuestLine[]): Promise<Cart> {
  await getAllProducts().catch(() => null);
  const items: Cart['items'] = [];
  for (const line of lines) {
    const product = getProductById(line.productId);
    if (!product || !product.inStock) continue;
    items.push({
      ...line,
      product,
      lineTotal: product.price * line.quantity,
    });
  }
  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
}

async function readGuestLines(): Promise<GuestLine[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GuestLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Guards the sign-in merge so a token refresh cannot merge twice.
  const merging = useRef(false);
  // The token the bag currently reflects; detects sign-in vs sign-out.
  const loadedFor = useRef<string | null | undefined>(undefined);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (accessToken) {
        if (!merging.current) {
          merging.current = true;
          try {
            const guest = await readGuestLines();
            for (const line of guest.slice(0, 50)) {
              try {
                await addCartItem(accessToken, line);
              } catch {
                // A bad line (sold out, unknown) is dropped; the rest cross.
              }
            }
            if (guest.length > 0) await AsyncStorage.removeItem(STORAGE_KEY).catch(() => null);
          } finally {
            merging.current = false;
          }
        }
        setCart(await fetchCart(accessToken));
      } else {
        setCart(await buildGuestCart(await readGuestLines()));
      }
      loadedFor.current = accessToken ?? null;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not load your bag.');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Reload whenever who is signed in changes; once on launch.
  useEffect(() => {
    if (loadedFor.current !== (accessToken ?? null)) void load();
  }, [accessToken, load]);

  useEffect(() => {
    void load();
  }, [load]);

  const mutate = useCallback(async (work: () => Promise<Cart>) => {
    setIsLoading(true);
    setError(null);
    try {
      setCart(await work());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addItem = useCallback(
    async (input: AddItemInput) => {
      if (accessToken) {
        await mutate(() => addCartItem(accessToken, input));
        return;
      }
      await mutate(async () => {
        const lines = await readGuestLines();
        const quantity = clampQuantity(input.quantity ?? 1);
        const id = lineId(input.productId, input.color, input.size);
        const existing = lines.find((line) => line.id === id);
        const next = existing
          ? lines.map((line) =>
              line.id === id ? { ...line, quantity: clampQuantity(line.quantity + quantity) } : line,
            )
          : [...lines, { id, productId: input.productId, color: input.color, size: input.size, quantity }];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return buildGuestCart(next);
      });
    },
    [accessToken, mutate],
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (accessToken) {
        await mutate(() => apiUpdateQuantity(accessToken, id, quantity));
        return;
      }
      await mutate(async () => {
        const lines = await readGuestLines();
        const next =
          quantity <= 0
            ? lines.filter((line) => line.id !== id)
            : lines.map((line) =>
                line.id === id ? { ...line, quantity: clampQuantity(quantity) } : line,
              );
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return buildGuestCart(next);
      });
    },
    [accessToken, mutate],
  );

  const removeItem = useCallback(
    async (id: string) => {
      if (accessToken) {
        await mutate(() => apiRemoveCartItem(accessToken, id));
        return;
      }
      await mutate(async () => {
        const next = (await readGuestLines()).filter((line) => line.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return buildGuestCart(next);
      });
    },
    [accessToken, mutate],
  );

  const clear = useCallback(async () => {
    if (accessToken) {
      await mutate(() => apiClearCart(accessToken));
      return;
    }
    await mutate(async () => {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return EMPTY_CART;
    });
  }, [accessToken, mutate]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const value = useMemo<CartContextValue>(
    () => ({
      ...cart,
      isLoading,
      error,
      isGuest: !user,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      refresh,
    }),
    [cart, isLoading, error, user, addItem, updateQuantity, removeItem, clear, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Read and control the bag from any screen.
 * Throws outside <CartProvider>, because that is a wiring mistake rather
 * than something a customer can cause.
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside a <CartProvider>.');
  return context;
}

