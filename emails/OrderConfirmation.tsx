import { Html, Head, Section, Img, Text } from "@react-email/components";
import { EmailShell, E } from "./EmailShell";

export default function OrderConfirmation({ order, items }: { order: any; items: any[] }) {
  return (
    <Html>
      <Head />
      <EmailShell preview={`Order ${order.number} confirmed — total £${(order.totalCents / 100).toFixed(2)}`}>
        <E.eyebrow>Order Confirmed</E.eyebrow>
        <E.h1>Thanks, {order.shipName.split(" ")[0]}.</E.h1>
        <E.p>Order <strong style={{ color: E.colors.ink }}>{order.number}</strong> is paid and being prepared for dispatch from Birmingham.</E.p>

        <E.hr />

        {items.map((i: any) => (
          <Section key={i.id} style={{ padding: "10px 0", borderBottom: `1px solid ${E.colors.line}` }}>
            <table width="100%" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td width={60} style={{ verticalAlign: "top" }}>
                    {i.imageUrl ? <Img src={i.imageUrl} width={56} height={70} style={{ objectFit: "cover" }} /> : null}
                  </td>
                  <td style={{ paddingLeft: 14, verticalAlign: "top" }}>
                    <Text style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.18em", color: E.colors.muted, margin: 0, fontWeight: 700 }}>{i.brandName}</Text>
                    <Text style={{ margin: "2px 0", fontSize: 14, color: E.colors.ink }}>{i.productName}</Text>
                    <Text style={{ fontSize: 12, color: E.colors.muted, margin: 0 }}>Size {i.size} · qty {i.quantity}</Text>
                  </td>
                  <td align="right" style={{ verticalAlign: "top" }}>
                    <Text style={{ margin: 0, fontSize: 14, color: E.colors.ink, fontWeight: 600 }}>£{((i.unitPriceCents * i.quantity) / 100).toFixed(2)}</Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>
        ))}

        <Section style={{ paddingTop: 16 }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <tr><td><Text style={{ margin: "4px 0", color: E.colors.muted, fontSize: 13 }}>Subtotal</Text></td><td align="right"><Text style={{ margin: "4px 0", fontSize: 13 }}>£{(order.subtotalCents/100).toFixed(2)}</Text></td></tr>
              <tr><td><Text style={{ margin: "4px 0", color: E.colors.muted, fontSize: 13 }}>Shipping</Text></td><td align="right"><Text style={{ margin: "4px 0", fontSize: 13 }}>{order.shippingCents === 0 ? "Free" : `£${(order.shippingCents/100).toFixed(2)}`}</Text></td></tr>
              <tr><td><Text style={{ margin: "8px 0 0", fontWeight: 700, fontSize: 15 }}>Total</Text></td><td align="right"><Text style={{ margin: "8px 0 0", fontWeight: 700, fontSize: 15 }}>£{(order.totalCents/100).toFixed(2)}</Text></td></tr>
            </tbody>
          </table>
        </Section>

        <E.hr />

        <Text style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: E.colors.muted, fontWeight: 700, margin: "0 0 4px" }}>Shipping To</Text>
        <E.p style={{ margin: 0 }}>
          {order.shipName}<br/>
          {order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ""}<br/>
          {order.shipCity}, {order.shipPostcode}<br/>
          {order.shipCountry}
        </E.p>

        <E.button href={`${process.env.NEXT_PUBLIC_SITE_URL}/account/orders`}>Track Order →</E.button>
      </EmailShell>
    </Html>
  );
}
