import { Html, Head } from "@react-email/components";
import { EmailShell, E } from "./EmailShell";

export default function ShippingUpdate({ order, trackingUrl }: { order: any; trackingUrl?: string }) {
  return (
    <Html>
      <Head />
      <EmailShell preview={`Order ${order.number} has shipped`}>
        <E.eyebrow>Dispatched</E.eyebrow>
        <E.h1>On its way.</E.h1>
        <E.p>Order <strong style={{ color: E.colors.ink }}>{order.number}</strong> has left our Birmingham warehouse and is heading to {order.shipCity}.</E.p>
        {trackingUrl ? <E.button href={trackingUrl}>Track Shipment →</E.button> : null}
        <E.hr />
        <E.p style={{ fontSize: 12 }}>Most UK orders arrive in 2–4 working days. If it doesn't show up by day 5, hit reply and we'll chase it.</E.p>
      </EmailShell>
    </Html>
  );
}
