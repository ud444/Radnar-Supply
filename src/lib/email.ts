import { Resend } from "resend";
import { render } from "@react-email/render";
import { db } from "./prisma";
import { siteUrl } from "./url";
import OrderConfirmation from "../../emails/OrderConfirmation";
import ShippingUpdate from "../../emails/ShippingUpdate";
import PasswordReset from "../../emails/PasswordReset";
import Welcome from "../../emails/Welcome";

const FROM = process.env.EMAIL_FROM || "Radnar Supply <onboarding@resend.dev>";

function r() {
  const k = process.env.RESEND_API_KEY;
  if (!k) return null;
  return new Resend(k);
}

async function send(to: string, subject: string, html: string) {
  const client = r();
  if (!client) { console.log(`[email:dev] -> ${to} :: ${subject}`); return { id: "dev" }; }
  return client.emails.send({ from: FROM, to, subject, html });
}

export async function sendOrderConfirmation(orderId: string) {
  const o = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
  const html = await render(OrderConfirmation({ order: o, items: o.items }));
  return send(o.email, `Order confirmed · ${o.number}`, html);
}

export async function sendShippingUpdate(orderId: string, trackingUrl?: string) {
  const o = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  const html = await render(ShippingUpdate({ order: o, trackingUrl }));
  return send(o.email, `Your order is on its way · ${o.number}`, html);
}

/** Alert the Radnar inbox that a new (paid) order has come in. */
export async function sendNewOrderAdmin(orderId: string) {
  const inbox = process.env.SOURCING_INBOX || process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || "hello@radnarsupply.com";
  const o = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
  const lines = o.items
    .map((i: { quantity: number; brandName: string; productName: string; size: string; unitPriceCents: number }) =>
      `<tr><td style="padding:4px 0;font-size:13px;color:#0A0A0A">${i.quantity}× ${i.brandName} — ${i.productName} <span style="color:#888">(${i.size})</span></td><td style="padding:4px 0;text-align:right;font-size:13px">£${((i.unitPriceCents * i.quantity) / 100).toFixed(2)}</td></tr>`)
    .join("");
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#0A0A0A;color:#fff;padding:18px 22px;font-weight:800;letter-spacing:1px;text-transform:uppercase">New Order · ${o.number}</div>
    <div style="border:1px solid #eee;border-top:none;padding:22px">
      <table style="border-collapse:collapse;width:100%">
        ${row("Customer", o.email)}
        ${row("Ship to", `${o.shipName}, ${o.shipCity}, ${o.shipPostcode}, ${o.shipCountry}`)}
      </table>
      <table style="border-collapse:collapse;width:100%;margin-top:14px;border-top:1px solid #eee;padding-top:8px">${lines}
        <tr><td style="padding:10px 0 0;font-weight:800;text-transform:uppercase;font-size:12px">Total</td><td style="padding:10px 0 0;text-align:right;font-weight:800">£${(o.totalCents / 100).toFixed(2)}</td></tr>
      </table>
      <div style="margin-top:18px;font-size:12px;color:#888">Manage in the admin panel under Orders.</div>
    </div>
  </div>`;
  return send(inbox, `New order — ${o.number} · £${(o.totalCents / 100).toFixed(2)}`, html);
}

/** Tell a shopper a sold-out product they wanted is back in stock. */
export async function sendBackInStock(args: { to: string; productName: string; brandName: string; slug: string; siteUrl: string }) {
  const url = `${args.siteUrl.replace(/\/$/, "")}/product/${args.slug}`;
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#0A0A0A;color:#fff;padding:18px 22px;font-weight:800;letter-spacing:1px;text-transform:uppercase">Back In Stock</div>
    <div style="border:1px solid #eee;border-top:none;padding:22px;color:#0A0A0A;font-size:15px;line-height:1.6">
      <p>Good news — the piece you wanted is available again:</p>
      <p style="padding:12px 14px;background:#F4F1EA;font-weight:600">${args.brandName} — ${args.productName}</p>
      <p style="color:#888;font-size:13px">Stock is limited and moves fast. Grab it before it's gone again.</p>
      <a href="${url}" style="display:inline-block;margin-top:14px;background:#FF4D00;color:#fff;padding:14px 26px;font-weight:800;letter-spacing:1px;text-transform:uppercase;text-decoration:none">Shop It Now →</a>
      <p style="margin-top:18px">— Radnar Supply</p>
    </div>
  </div>`;
  return send(args.to, `Back in stock — ${args.brandName} ${args.productName}`, html);
}

export async function sendRefundConfirmation(orderId: string, amountCents: number) {
  const o = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  const amount = `£${(amountCents / 100).toFixed(2)}`;
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#0A0A0A;color:#fff;padding:18px 22px;font-weight:800;letter-spacing:1px;text-transform:uppercase">Refund Processed</div>
    <div style="border:1px solid #eee;border-top:none;padding:22px;color:#0A0A0A;font-size:15px;line-height:1.6">
      <p>We've processed a refund of <strong>${amount}</strong> for order <strong>${o.number}</strong>.</p>
      <p>It can take 5–10 working days to appear on your statement, depending on your bank.</p>
      <p style="margin-top:22px">— Radnar Supply</p>
    </div>
  </div>`;
  return send(o.email, `Refund processed · ${o.number}`, html);
}

/** Send the customer a price + a pay-now link for a sourced item. */
export async function sendSourcingQuote(args: {
  to: string; name: string; item: string; amountCents: number; detail?: string | null; payUrl: string;
}) {
  const amount = `£${(args.amountCents / 100).toFixed(2)}`;
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#0A0A0A;color:#fff;padding:18px 22px;font-weight:800;letter-spacing:1px;text-transform:uppercase">We Found It</div>
    <div style="border:1px solid #eee;border-top:none;padding:22px;color:#0A0A0A;font-size:15px;line-height:1.6">
      <p>Hi ${args.name},</p>
      <p>Good news — we've sourced your request:</p>
      <p style="padding:12px 14px;background:#F4F1EA;font-weight:600">${args.detail || args.item}</p>
      <p style="font-size:22px;font-weight:800;margin:18px 0 6px">${amount}</p>
      <p style="color:#888;font-size:13px;margin-top:0">Includes sourcing. Secure checkout via Stripe.</p>
      <a href="${args.payUrl}" style="display:inline-block;margin-top:14px;background:#FF4D00;color:#fff;padding:14px 26px;font-weight:800;letter-spacing:1px;text-transform:uppercase;text-decoration:none">Pay Now →</a>
      <p style="margin-top:22px;color:#888;font-size:13px">No obligation — this link simply reserves the item once paid. Reply to this email with any questions.</p>
      <p style="margin-top:18px">— Radnar Supply</p>
    </div>
  </div>`;
  return send(args.to, "We found it — your Radnar Supply quote", html);
}

function shell(badge: string, inner: string) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#0A0A0A;color:#fff;padding:18px 22px;font-weight:800;letter-spacing:1px;text-transform:uppercase">${badge}</div>
    <div style="border:1px solid #eee;border-top:none;padding:22px;color:#0A0A0A;font-size:15px;line-height:1.6">${inner}</div>
  </div>`;
}
function cta(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:14px;background:#FF4D00;color:#fff;padding:14px 26px;font-weight:800;letter-spacing:1px;text-transform:uppercase;text-decoration:none">${label}</a>`;
}

/** Order didn't complete (Stripe session expired / payment failed). */
export async function sendOrderCancelled(orderId: string) {
  const o = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  const url = `${siteUrl()}/shop`;
  const html = shell("Order Not Completed", `
    <p>Hi,</p>
    <p>Your order <strong>${o.number}</strong> didn't go through — the payment wasn't completed, so nothing was charged and the items have been released back to stock.</p>
    <p>Still want them? They may not last long.</p>
    ${cta(url, "Shop Again →")}
    <p style="margin-top:18px;color:#888;font-size:13px">If you think this is a mistake, just reply to this email.</p>`);
  return send(o.email, `Your Radnar order didn't complete · ${o.number}`, html);
}

/** Delivered — thank-you + soft review/repeat nudge. */
export async function sendDelivered(orderId: string) {
  const o = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  const html = shell("Delivered", `
    <p>Hi ${o.shipName?.split(" ")[0] || "there"},</p>
    <p>Your order <strong>${o.number}</strong> should have landed. We hope it's everything you wanted.</p>
    <p>Loved it? Reply and tell us — it helps us source more of what you want. Anything not right? Reply here and we'll sort it fast.</p>
    ${cta(`${siteUrl()}/shop?sort=newest`, "See What's New →")}
    <p style="margin-top:18px">— Radnar Supply</p>`);
  return send(o.email, `Enjoy it — ${o.number} delivered`, html);
}

/** Newsletter welcome + first-order code (enable promo codes in Stripe to honour it). */
export async function sendNewsletterWelcome(to: string) {
  const html = shell("You're On The List", `
    <p>Welcome to Radnar Supply.</p>
    <p>You'll get first access to new stock, sourcing drops and members-only releases before they go public.</p>
    <p>Here's <strong>10% off</strong> your first order:</p>
    <p style="font-family:monospace;font-size:22px;font-weight:800;letter-spacing:3px;background:#F4F1EA;padding:14px;text-align:center">RADNAR10</p>
    ${cta(`${siteUrl()}/shop`, "Start Shopping →")}
    <p style="margin-top:18px;color:#888;font-size:13px">Apply it at checkout. — Radnar Supply</p>`);
  return send(to, "Welcome to Radnar Supply — 10% inside", html);
}

/** Abandoned checkout nudge (PENDING order left unpaid). */
export async function sendAbandonedCart(orderId: string) {
  const o = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
  const lines = o.items
    .map((i: { quantity: number; brandName: string; productName: string; size: string }) =>
      `<li style="margin-bottom:4px">${i.quantity}× ${i.brandName} — ${i.productName} <span style="color:#888">(${i.size})</span></li>`).join("");
  const html = shell("Still Thinking It Over?", `
    <p>You left these in your bag:</p>
    <ul style="padding-left:18px;margin:12px 0">${lines}</ul>
    <p>Stock is limited and verified pieces move fast — finish up before they're gone.</p>
    ${cta(`${siteUrl()}/checkout`, "Complete Checkout →")}
    <p style="margin-top:18px;color:#888;font-size:13px">Questions before you buy? Just reply.</p>`);
  return send(o.email, `Your bag's waiting · ${o.number}`, html);
}

/** Quote follow-up — sourced item quoted but not yet paid. */
export async function sendQuoteFollowup(requestId: string) {
  const rq = await db.sourcingRequest.findUniqueOrThrow({ where: { id: requestId } });
  const amount = rq.quoteCents ? `£${(rq.quoteCents / 100).toFixed(2)}` : "your quote";
  const html = shell("Still Want It?", `
    <p>Hi ${rq.name},</p>
    <p>Just following up on the piece we sourced for you${rq.quoteDetail ? ` — <strong>${rq.quoteDetail}</strong>` : ""}, quoted at <strong>${amount}</strong>.</p>
    <p>It's still available, but we can't hold it indefinitely. Secure it here:</p>
    ${rq.quoteUrl ? cta(rq.quoteUrl, "Pay Now →") : ""}
    <p style="margin-top:18px;color:#888;font-size:13px">Changed your mind or need a tweak? Reply and let us know. — Radnar Supply</p>`);
  return send(rq.email, "Still want it? — your Radnar quote", html);
}

export async function sendPasswordReset(to: string, link: string) {
  const html = await render(PasswordReset({ link }));
  return send(to, "Reset your Radnar Supply password", html);
}

export async function sendWelcome(to: string, name?: string | null) {
  const html = await render(Welcome({ name }));
  return send(to, "Welcome to Radnar Supply", html);
}

type SourcingPayload = {
  id: string;
  type: "STANDARD" | "PRIVATE";
  name: string;
  email: string;
  phone?: string | null;
  item: string;
  size?: string | null;
  budget?: string | null;
  detail?: string | null;
  imageUrls: string[];
};

function row(label: string, value?: string | null) {
  if (!value) return "";
  return `<tr><td style="padding:6px 14px 6px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;vertical-align:top">${label}</td><td style="padding:6px 0;font-size:14px;color:#0A0A0A">${value}</td></tr>`;
}

/** Notify the Radnar inbox of a new sourcing / personal-shopping request. */
export async function sendSourcingRequestAdmin(req: SourcingPayload) {
  const inbox = process.env.SOURCING_INBOX || process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || "hello@radnarsupply.com";
  const kind = req.type === "PRIVATE" ? "RADNAR Private (luxury)" : "Personal Shopping / Sourcing";
  const imgs = req.imageUrls.length
    ? `<div style="margin-top:12px">${req.imageUrls.map((u) => `<a href="${u}" style="color:#FF4D00">${u}</a>`).join("<br/>")}</div>`
    : "";
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#0A0A0A;color:#fff;padding:18px 22px;font-weight:800;letter-spacing:1px;text-transform:uppercase">New ${kind} Request</div>
    <div style="border:1px solid #eee;border-top:none;padding:22px">
      <table style="border-collapse:collapse;width:100%">
        ${row("Name", req.name)}
        ${row("Email", req.email)}
        ${row("Phone", req.phone)}
        ${row("Item", req.item)}
        ${row("Size", req.size)}
        ${row("Budget", req.budget)}
        ${row("Detail", req.detail)}
      </table>
      ${imgs}
      <div style="margin-top:18px;font-size:12px;color:#888">Manage this request in the admin panel under Requests · ID ${req.id}</div>
    </div>
  </div>`;
  return send(inbox, `New ${req.type === "PRIVATE" ? "RADNAR Private" : "sourcing"} request — ${req.name}`, html);
}

/** Acknowledge the requester. */
export async function sendSourcingRequestConfirmation(req: SourcingPayload) {
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#0A0A0A;color:#fff;padding:18px 22px;font-weight:800;letter-spacing:1px;text-transform:uppercase">Request Received</div>
    <div style="border:1px solid #eee;border-top:none;padding:22px;color:#0A0A0A;font-size:15px;line-height:1.6">
      <p>Hi ${req.name},</p>
      <p>Thanks for your ${req.type === "PRIVATE" ? "RADNAR Private" : "sourcing"} request. Our team is now searching our network of trusted suppliers and industry contacts for:</p>
      <p style="padding:12px 14px;background:#F4F1EA;font-weight:600">${req.item}${req.size ? ` · Size ${req.size}` : ""}</p>
      <p>We'll be in touch shortly with options and pricing. If you need to add anything, just reply to this email.</p>
      <p style="margin-top:22px">— Radnar Supply</p>
    </div>
  </div>`;
  return send(req.email, "We're on it — your Radnar Supply request", html);
}
