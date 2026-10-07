# HEFA Mobile

The Android app for HEFA, the Nigerian tailoring label. Built with **Expo**
(React Native), **TypeScript** and **Expo Router**.

It shares its brand identity and product catalogue with the HEFA website, so
the two look and behave like the same store.

---

## Running it on your phone

You need the **Expo Go** app on your Android phone (free, from the Play Store).

Then, from this folder:

```bash
npm start
```

A QR code appears in the terminal. Open **Expo Go** on your phone and scan it.

**Your phone and this computer must be on the same Wi-Fi network.** If the
connection is refused, see [Troubleshooting](#troubleshooting) below.

As you edit files, the app updates on your phone automatically.

---

## Project layout

```
src/
  app/              screens — the file name is the URL
    _layout.tsx       root: loads fonts, wraps every screen
    index.tsx         the home screen
  components/       reusable UI
    ProductCard.tsx   one product in a grid
  lib/              data and helpers
    products.ts       the catalogue — Supabase with an offline fallback
    data/products.ts  the offline copy
    supabase.ts       the database connection
    productImages.ts  maps database photo paths to bundled image files
    types.ts          shared data shapes
    format.ts         money formatting
  theme.ts          ALL colours, fonts and spacing live here
assets/
  products/         product photography
.env.local          database credentials (git-ignored)
```

There is no `node_modules` in the listing above because it holds installed
packages, not your own code — never edit it.

### Adding a screen

Create a file in `src/app`. For a screen called "shop":

```
src/app/shop.tsx
```

That is it — no registration step. Expo Router reads the folder and makes the
screen available at `/shop`.

---

## The theme file

`src/theme.ts` is the single source of truth for how the app looks.

**Never type a colour directly into a screen.** Import it instead:

```tsx
import { colors, fonts, spacing } from '@/theme';

<Text style={{ color: colors.burntOrange, fontFamily: fonts.serif }}>Shop</Text>
```

This is why the app stays consistent, and why restyling the whole thing later
means editing one file rather than hunting through every screen.

---

## What is built so far

- [x] Project scaffold and Android dev setup
- [x] HEFA brand theme (colours, fonts, spacing)
- [x] Product catalogue — reads the live Supabase database, with an offline copy as a fallback
- [x] Home screen — brand hero + Featured products
- [ ] Shop and product screens
- [ ] Cart
- [ ] Account and sign-in

## Where the products come from

The app reads the **same Supabase database as the website**, so a price change
made there appears here too. `src/lib/products.ts` is the only file that talks
to the database.

If the database cannot be reached — no internet, or credentials missing — the app
falls back to `src/lib/data/products.ts` rather than showing an empty shop. The
line at the bottom of the home screen says which one you are seeing, so it is
never a guess.

**Adding a product photo** takes two steps, because a phone cannot load a path
like `/images/products/x.jpg` — every image must be named literally in the code:

1. Save the file in `assets/products/` as `<slug>-<n>.jpg`
2. Add one line to the map in `src/lib/productImages.ts`

Nothing else needs changing.

---

## Two things to know

**Payments are not in the app, on purpose.** Placing an order needs secret keys
that bypass the database's security rules. Those keys must never ship inside an
app — anyone can unpack one and steal them, then issue refunds against the
store's Paystack account. An app has no server, so there is nowhere safe to
keep them. The plan is to build the cart in the app and hand off to the
website's secure checkout.

**Product photos are copies.** The photographs in `assets/products/` were copied
from the website, because a database can only store a text path like
`/images/products/x.jpg` — which resolves on a website but not on a phone.

The site is now live at `https://hefa-store-one.vercel.app`, so these paths
*could* be fetched over the network instead. The bundled copies are kept for now
so the app works with no connection at all; once the API endpoints exist they can
be dropped and the app will load photos straight from the live site.

---

## Building an installable app (EAS)

Expo Go is a playground. To get a real app with your own icon in the app drawer,
build an **APK** using EAS — Expo's cloud build service. It runs the Android
build on their servers, so **no Android Studio or Java is needed on this Mac**.

**One-time setup.** You need a free account at [expo.dev](https://expo.dev),
then from this folder:

```bash
npx eas-cli@latest login
npx eas-cli@latest init
```

`init` links this folder to your account and writes a `projectId` into
`app.json`. It needs your credentials, so run it yourself.

**Environment variables.** `.env.local` is git-ignored, so the build server
cannot see it. Send the two public values up once:

```bash
npx eas-cli@latest env:create --environment preview \
  --name EXPO_PUBLIC_SUPABASE_URL --value "<your supabase url>"

npx eas-cli@latest env:create --environment preview \
  --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "<your publishable key>"
```

Only the *publishable* key is needed. The app never holds a secret key.

**Build it:**

```bash
npx eas-cli@latest build --platform android --profile preview
```

That produces an `.apk`. Download it, transfer it to your phone (cable, or open
the build's link on the phone), and tap it to install. Allow "install from
unknown sources" when Android asks.

**Build profiles** are defined in `eas.json`:

| Profile | Output | For |
|---|---|---|
| `preview` | `.apk` | Testing on your own phone |
| `production` | `.aab` | Uploading to Google Play |
| `development` | `.apk` | A dev build with the debugger |

### Releasing an update later

`android.versionCode` in `app.json` is Android's own build number, separate from
`version`. It **must increase by at least 1** on every release, or Google Play
rejects the upload. Bump it by hand each time.

---

## Troubleshooting

**"Something went wrong" / connection refused**
The phone and computer are on different networks. Join them to the same Wi-Fi,
or, if your router isolates devices, run the tunnel instead:

```bash
npx expo start --tunnel
```

**Fonts look like plain system text**
The Google Fonts download has not finished. It resolves in a second or two; if
it persists, check your connection and reload the app.

**Port 8081 already in use**
Another Expo project is running. Stop it, or start this one on a different
port:

```bash
npx expo start --port 8082
```

**Start over from scratch**
```bash
rm -rf node_modules .expo && npm install
```

---

## Notes

- **Expo Go is a playground.** It is ideal for building and testing. When the
  app is ready for the Play Store it needs a proper build — `npx eas build`
  does this in the cloud, with a free tier.
- **No Android Studio or Java needed** for any of the above.
- The `android/` and `ios/` folders in `.gitignore` are generated only at build
  time; Expo does not need them committed.
