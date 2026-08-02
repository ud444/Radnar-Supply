/**
 * Every email the store can send, what fires it, and who receives it.
 *
 * This is the single source of truth for the admin Emails screen. Keep it in
 * step with src/lib/email.ts — if you add a sender there, add its entry here so
 * the operator can see it exists and test it.
 */
export type Audience = "customer" | "admin" | "subscriber";

export type EmailDef = {
  id: string;
  name: string;
  audience: Audience;
  /** What causes it to send, in the operator's language. */
  trigger: string;
  /** Where that happens, for someone reading the code later. */
  source: string;
  /** Whether the Emails screen can fire a harmless test of it. */
  testable: boolean;
};

export const EMAIL_GROUPS: { group: string; note: string; emails: EmailDef[] }[] = [
  {
    group: "Orders",
    note: "Fired by the Stripe webhook and by fulfilment changes you make in Orders.",
    emails: [
      {
        id: "order-confirmation", name: "Order confirmation", audience: "customer",
        trigger: "Checkout completes and Stripe confirms payment",
        source: "api/webhooks/stripe", testable: true,
      },
      {
        id: "new-order-admin", name: "New order alert", audience: "admin",
        trigger: "Same moment as the confirmation — tells you a sale landed",
        source: "api/webhooks/stripe", testable: true,
      },
      {
        id: "shipping-update", name: "Shipping update", audience: "customer",
        trigger: "You set an order to Shipped with \"email the customer\" ticked",
        source: "admin/orders", testable: true,
      },
      {
        id: "delivered", name: "Delivered", audience: "customer",
        trigger: "You set an order to Delivered with \"email the customer\" ticked",
        source: "admin/orders", testable: true,
      },
      {
        id: "order-cancelled", name: "Order cancelled", audience: "customer",
        trigger: "Stripe reports the checkout expired or payment failed",
        source: "api/webhooks/stripe", testable: true,
      },
      {
        id: "refund-confirmation", name: "Refund confirmation", audience: "customer",
        trigger: "You refund an order, in full or in part",
        source: "admin/orders/[id]", testable: true,
      },
    ],
  },
  {
    group: "Sourcing",
    note: "Personal shopping and private sourcing enquiries.",
    emails: [
      {
        id: "sourcing-request-admin", name: "New enquiry alert", audience: "admin",
        trigger: "A customer submits the sourcing form",
        source: "(shop)/sourcing", testable: true,
      },
      {
        id: "sourcing-request-confirmation", name: "Enquiry received", audience: "customer",
        trigger: "Same moment — reassures the customer it arrived",
        source: "(shop)/sourcing", testable: true,
      },
      {
        id: "sourcing-quote", name: "Your quote", audience: "customer",
        trigger: "You send a quote from a request, with the Stripe pay link",
        source: "admin/requests/[id]", testable: true,
      },
      {
        id: "quote-admin-confirmation", name: "Quote sent confirmation", audience: "admin",
        trigger: "Same moment — your copy of what the customer received",
        source: "admin/requests/[id]", testable: true,
      },
      {
        id: "quote-followup", name: "Quote follow-up", audience: "customer",
        trigger: "Scheduled daily — chases quotes still unpaid after a few days",
        source: "api/cron/quote-followups", testable: true,
      },
    ],
  },
  {
    group: "Account",
    note: "Triggered by the customer's own actions.",
    emails: [
      {
        id: "welcome", name: "Welcome", audience: "customer",
        trigger: "Someone registers an account",
        source: "(auth)/actions", testable: true,
      },
      {
        id: "password-reset", name: "Password reset", audience: "customer",
        trigger: "Someone requests a reset link from Forgot password",
        source: "(auth)/actions", testable: true,
      },
    ],
  },
  {
    group: "Marketing",
    note: "Opt-in only. Broadcast goes to your Resend audience, not to all customers.",
    emails: [
      {
        id: "newsletter-welcome", name: "Newsletter welcome", audience: "subscriber",
        trigger: "Someone subscribes through the storefront footer",
        source: "api/newsletter", testable: true,
      },
      {
        id: "back-in-stock", name: "Back in stock", audience: "customer",
        trigger: "A variant someone asked about is restocked",
        source: "lib/restock", testable: true,
      },
      {
        id: "abandoned-cart", name: "Abandoned cart", audience: "customer",
        trigger: "Scheduled hourly — an order was started but never paid",
        source: "api/cron/abandoned-carts", testable: true,
      },
      {
        id: "broadcast", name: "Drop announcement", audience: "subscriber",
        trigger: "You send one manually from Broadcast",
        source: "admin/broadcast", testable: false,
      },
    ],
  },
];

export const ALL_EMAILS: EmailDef[] = EMAIL_GROUPS.flatMap((g) => g.emails);

export const AUDIENCE_LABEL: Record<Audience, string> = {
  customer: "Customer",
  admin: "You",
  subscriber: "Subscriber",
};
