import { Html, Head, Body, Container, Text, Heading, Button } from "@react-email/components";

export default function PasswordReset({ link }: { link: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ background: "#fafafa", fontFamily: "Inter, -apple-system, sans-serif", color: "#0a0a0a", margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: 32, background: "#fff" }}>
          <Text style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9ca3af", margin: 0 }}>Radnar Supply</Text>
          <Heading style={{ fontSize: 26, letterSpacing: "-0.02em", margin: "8px 0 4px" }}>Reset your password.</Heading>
          <Text style={{ color: "#6b7280" }}>Tap the button below to set a new password. This link expires in one hour.</Text>
          <Button href={link} style={{ background: "#0a0a0a", color: "#fff", padding: "14px 22px", borderRadius: 999, fontSize: 14, textDecoration: "none", display: "inline-block", marginTop: 12 }}>
            Reset password
          </Button>
          <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 24 }}>
            If you didn't request this, you can ignore the email — your password stays the same.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
