import { Html, Head, Body, Container, Section, Text, Heading, Hr, Img, Link } from "@react-email/components";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://radnar.supply";

export default function OrderConfirmation({ order, items }: { order: any; items: any[] }) {
  return (
    <Html>
      <Head />
      <Body style={{ background: "#fafafa", fontFamily: "Inter, -apple-system, sans-serif", color: "#0a0a0a", margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: 32, background: "#fff" }}>
          <Text style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9ca3af", margin: 0 }}>Radnar Supply</Text>
          <Heading style={{ fontSize: 26, letterSpacing: "-0.02em", margin: "8px 0 4px" }}>Order confirmed.</Heading>
          <Text style={{ color: "#6b7280", margin: "0 0 20px" }}>
            Thanks {order.shipName}. Order <strong>{order.number}</strong> is paid and being prepared for dispatch.
          </Text>
          <Hr style={{ borderColor: "#e5e7eb" }} />
          {items.map((i: any) => (
            <Section key={i.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
              <table width="100%" cellPadding={0} cellSpacing={0}>
                <tr>
                  <td width={60} valign="top">
                    {i.imageUrl ? <Img src={i.imageUrl} width={60} height={75} style={{ objectFit: "cover", borderRadius: 4 }} /> : null}
                  </td>
                  <td style={{ paddingLeft: 12, verticalAlign: "top" }}>
                    <Text style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.16em", color: "#9ca3af", margin: 0 }}>{i.brandName}</Text>
                    <Text style={{ margin: "2px 0", fontSize: 14 }}>{i.productName}</Text>
                    <Text style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Size {i.size} · qty {i.quantity}</Text>
                  </td>
                  <td align="right" style={{ verticalAlign: "top" }}>
                    <Text style={{ margin: 0, fontSize: 14 }}>£{((i.unitPriceCents * i.quantity) / 100).toFixed(2)}</Text>
                  </td>
                </tr>
              </table>
            </Section>
          ))}
          <Section style={{ paddingTop: 12 }}>
            <table width="100%" cellPadding={0} cellSpacing={0}>
              <tr><td><Text style={{ margin: "4px 0", color: "#6b7280" }}>Subtotal</Text></td><td align="right"><Text style={{ margin: "4px 0" }}>£{(order.subtotalCents/100).toFixed(2)}</Text></td></tr>
              <tr><td><Text style={{ margin: "4px 0", color: "#6b7280" }}>Shipping</Text></td><td align="right"><Text style={{ margin: "4px 0" }}>{order.shippingCents === 0 ? "Free" : `£${(order.shippingCents/100).toFixed(2)}`}</Text></td></tr>
              <tr><td><Text style={{ margin: "8px 0 0", fontWeight: 600 }}>Total</Text></td><td align="right"><Text style={{ margin: "8px 0 0", fontWeight: 600 }}>£{(order.totalCents/100).toFixed(2)}</Text></td></tr>
            </table>
          </Section>
          <Hr style={{ borderColor: "#e5e7eb", margin: "20px 0 16px" }} />
          <Text style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
            Shipping to: {order.shipName}, {order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ""}, {order.shipCity}, {order.shipPostcode}, {order.shipCountry}.
          </Text>
          <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 16 }}>
            Track this order in your <Link href={`${SITE}/account/orders`} style={{ color: "#0a0a0a" }}>Radnar account</Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
