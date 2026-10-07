/**
 * Contact form rules, mirrored from the website (web app: src/lib/contact.ts).
 *
 * The topics and validation are copied rather than reinvented so the phone
 * form accepts exactly what the browser form accepts — the same message, the
 * same minimum length, the same wording when something is missing.
 */

/** Topics offered in the contact form selector. */
export const CONTACT_TOPICS = [
  'Order enquiry',
  'Sizing advice',
  'Press & partnerships',
  'Wholesale',
  'Something else',
] as const;

/** The contact form fields. */
export interface ContactValues {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

export const INITIAL_CONTACT_VALUES: ContactValues = {
  name: '',
  email: '',
  topic: CONTACT_TOPICS[0],
  message: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate the contact form. Pure — returns error messages keyed by field, and
 * an empty object when everything is valid.
 */
export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};

  if (!values.name.trim()) errors.name = 'Please enter your name.';

  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.topic.trim()) errors.topic = 'Please choose a topic.';

  if (!values.message.trim()) {
    errors.message = 'Please enter a message.';
  } else if (values.message.trim().length < 10) {
    errors.message = 'Please add a little more detail (at least 10 characters).';
  }

  return errors;
}
