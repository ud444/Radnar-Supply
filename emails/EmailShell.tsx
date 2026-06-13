import { Body, Container, Hr, Img, Link, Section, Text } from "@react-email/components";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://radnar.supply";
const LOGO = `${SITE}/radnar-mark.png`;

const COLORS = { paper: "#F4F1EA", ink: "#0A0A0A", muted: "#5C5853", accent: "#FF4D00", line: "#D9D1C2" };

export function EmailShell({ children, preview }: { children: React.ReactNode; preview?: string }) {
  return (
    <Body style={{ background: COLORS.paper, margin: 0, padding: "32px 0", fontFamily: "Inter, -apple-system, sans-serif", color: COLORS.ink }}>
      {preview ? <span style={{ display: "none", opacity: 0, overflow: "hidden", height: 0 }}>{preview}</span> : null}
      <Container style={{ maxWidth: 560, margin: "0 auto", background: "#FFFEFB", border: `1px solid ${COLORS.line}` }}>
        {/* Header band */}
        <Section style={{ background: COLORS.ink, padding: "20px 28px" }}>
          <Img src={LOGO} alt="Radnar Supply" width={140} style={{ filter: "invert(1) brightness(2)", display: "block" }} />
        </Section>

        {/* Body */}
        <Section style={{ padding: "28px" }}>
          {children}
        </Section>

        {/* Accent stripe */}
        <Section style={{ background: COLORS.accent, height: 4, padding: 0 }} />

        {/* Footer */}
        <Section style={{ padding: "20px 28px", background: COLORS.ink, color: COLORS.paper }}>
          <Text style={{ margin: 0, color: "rgba(244,241,234,0.65)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Radnar Supply
          </Text>
          <Text style={{ margin: "8px 0 0", color: "rgba(244,241,234,0.7)", fontSize: 12, lineHeight: 1.5 }}>
            <Link href={`${SITE}/shop`} style={{ color: COLORS.paper, marginRight: 12 }}>Shop</Link>
            <Link href={`${SITE}/account/orders`} style={{ color: COLORS.paper, marginRight: 12 }}>Orders</Link>
            <Link href="mailto:hello@radnar.supply" style={{ color: COLORS.paper }}>hello@radnar.supply</Link>
          </Text>
          <Hr style={{ borderColor: "rgba(244,241,234,0.18)", margin: "16px 0" }} />
          <Text style={{ margin: 0, fontSize: 10.5, lineHeight: 1.6, color: "rgba(244,241,234,0.55)" }}>
            Radnar Supply Ltd · Company No. 17263761 · Birmingham, United Kingdom
          </Text>
          <Text style={{ margin: "4px 0 0", fontSize: 10.5, lineHeight: 1.6, color: "rgba(244,241,234,0.45)" }}>
            You're receiving this because you placed an order or registered an account with us. Reply to this email to unsubscribe from transactional updates.
          </Text>
        </Section>
      </Container>
    </Body>
  );
}

export const E = {
  h1: (props: any) => <Text {...props} style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px", ...props.style }} />,
  p:  (props: any) => <Text {...props} style={{ margin: "0 0 12px", color: COLORS.muted, fontSize: 14, lineHeight: 1.55, ...props.style }} />,
  hr: () => <Hr style={{ borderColor: COLORS.line, margin: "16px 0" }} />,
  eyebrow: (props: any) => <Text {...props} style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 700, margin: "0 0 6px", ...props.style }} />,
  button: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} style={{
      background: COLORS.ink, color: COLORS.paper, padding: "14px 22px", display: "inline-block",
      fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, textDecoration: "none", marginTop: 12,
    }}>{children}</a>
  ),
  colors: COLORS,
};
