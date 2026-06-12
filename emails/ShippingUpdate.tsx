import { Html, Head, Body, Container, Text, Heading, Hr, Link, Button } from "@react-email/components";

export default function ShippingUpdate({ order, trackingUrl }: { order: any; trackingUrl?: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ background: "#fafafa", fontFamily: "Inter, -apple-system, sans-serif", color: "#0a0a0a", margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: 32, background: "#fff" }}>
          <Text style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9ca3af", margin: 0 }}>Radnar Supply</Text>
          <Heading style={{ fontSize: 26, letterSpacing: "-0.02em", margin: "8px 0 4px" }}>Your order is on its way.</Heading>
          <Text style={{ color: "#6b7280" }}>Order <strong>{order.number}</strong> has shipped.</Text>
          <Hr style={{ borderColor: "#e5e7eb" }} />
          {trackingUrl ? (
            <Button href={trackingUrl} style={{ background: "#0a0a0a", color: "#fff", padding: "12px 20px", borderRadius: 999, fontSize: 14, textDecoration: "none", display: "inline-block", marginTop: 12 }}>
              Track shipment
            </Button>
          ) : null}
          <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 24 }}>
            Shipping to {order.shipName}, {order.shipCity}, {order.shipPostcode}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
