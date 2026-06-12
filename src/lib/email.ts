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
