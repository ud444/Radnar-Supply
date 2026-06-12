import { Html, Head, Body, Container, Text, Heading, Button } from "@react-email/components";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://radnar.supply";

export default function Welcome({ name }: { name?: string | null }) {
  return (
    <Html>
      <Head />
      <Body style={{ background: "#fafafa", fontFamily: "Inter, -apple-system, sans-serif", color: "#0a0a0a", margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: 32, background: "#fff" }}>
          <Text style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9ca3af", margin: 0 }}>Radnar Supply</Text>
          <Heading style={{ fontSize: 26, letterSpacing: "-0.02em", margin: "8px 0 4px" }}>Welcome{name ? `, ${name}` : ""}.</Heading>
          <Text style={{ color: "#6b7280" }}>You're in. Hand-picked designer pieces. Always below retail. Free UK delivery over £75.</Text>
          <Button href={`${SITE}/shop`} style={{ background: "#0a0a0a", color: "#fff", padding: "14px 22px", borderRadius: 999, fontSize: 14, textDecoration: "none", display: "inline-block", marginTop: 12 }}>
            Start shopping
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
