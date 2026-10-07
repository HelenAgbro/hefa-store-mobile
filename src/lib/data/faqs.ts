/**
 * FAQ content, copied verbatim from the website (web app: src/lib/data/faqs.ts).
 *
 * The two apps answer the same questions, so the words are kept identical
 * rather than rewritten — a customer who reads the FAQ on the phone and then
 * on the laptop should not find two different promises about returns.
 */

export type FaqCategory = 'Fit & Sizing' | 'Orders & Payment' | 'Shipping & Delivery' | 'Returns';

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

/** The categories, in the order the FAQ screen groups them. */
export const FAQ_CATEGORIES: FaqCategory[] = [
  'Fit & Sizing',
  'Orders & Payment',
  'Shipping & Delivery',
  'Returns',
];

/** FAQ content for the FAQ screen. */
export const FAQS: FaqItem[] = [
  {
    id: 'faq-sizes',
    category: 'Fit & Sizing',
    question: 'How do I choose the right size?',
    answer:
      'Use the size guide on any product page — it lists waist, hip and inseam measurements in centimetres. If you are between two sizes, we recommend sizing up for a relaxed fit. Pants are cut true to size, so follow the measurements rather than your usual waist size.',
  },
  {
    id: 'faq-between',
    category: 'Fit & Sizing',
    question: 'I am between two sizes — which should I pick?',
    answer:
      'For corporate pieces, size down if you prefer a close fit. For casual pieces, size up for more room through the thigh. If in doubt, message us and we will advise on the specific style.',
  },
  {
    id: 'faq-alterations',
    category: 'Fit & Sizing',
    question: 'Do you offer alterations or hemming?',
    answer:
      'Not yet. We are designing the collection so standard inseam lengths work for most customers. Alteration guidance will be published once the service is available.',
  },
  {
    id: 'faq-payment',
    category: 'Orders & Payment',
    question: 'Which payment methods do you accept?',
    answer:
      'We accept Naira and international cards through a secure Nigerian payment gateway. Your card details are entered on their page and never touch this app. This build runs in Paystack test mode, so no real money moves and no real card is charged.',
  },
  {
    id: 'faq-order',
    category: 'Orders & Payment',
    question: 'Will I get an order confirmation?',
    answer:
      'Yes — a confirmation email is sent as soon as your payment is confirmed, with your reference, the items and the delivery address. Keep the reference: it is the quickest way for us to find your order.',
  },
  {
    id: 'faq-stock',
    category: 'Orders & Payment',
    question: 'What happens if an item sells out?',
    answer:
      'Our pieces are produced in small runs. Sold-out items are marked clearly on the product page, and you can message us to join a restock list.',
  },
  {
    id: 'faq-delivery',
    category: 'Shipping & Delivery',
    question: 'How long does delivery take?',
    answer:
      'Standard delivery within Nigeria takes 3–5 business days, express takes 1–2 business days, and studio pickup is ready within 24 hours. International delivery typically takes 7–14 business days.',
  },
  {
    id: 'faq-shipping-cost',
    category: 'Shipping & Delivery',
    question: 'How much is shipping?',
    answer:
      'Standard delivery is ₦3,500 and becomes free on orders over ₦150,000. Express delivery is ₦7,500, and studio pickup in Lagos is always free.',
  },
  {
    id: 'faq-returns',
    category: 'Returns',
    question: 'What is your returns policy?',
    answer:
      'We accept returns within 14 days of delivery, provided items are unworn, unwashed and still have their tags attached. The first return delivery within Nigeria is free.',
  },
  {
    id: 'faq-exchange',
    category: 'Returns',
    question: 'Can I exchange for a different size?',
    answer:
      'Yes, if the item is in stock. Exchanges follow the same 14-day window as returns, and any price difference is settled on the replacement order.',
  },
  {
    id: 'faq-refund',
    category: 'Returns',
    question: 'How long do refunds take?',
    answer:
      'Once a return reaches our studio and is inspected, refunds are issued within 5–7 business days to the original payment method.',
  },
  {
    id: 'faq-fit-returns',
    category: 'Returns',
    question: 'What if my size does not fit?',
    answer:
      'Please return it within 14 days and we will exchange it. Fit feedback is genuinely useful to us — tell us what felt off so we can refine our size guide and future cuts.',
  },
];
