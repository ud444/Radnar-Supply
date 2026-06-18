import { Resend } from "resend";
import { render } from "@react-email/render";
import { db } from "./prisma";
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
