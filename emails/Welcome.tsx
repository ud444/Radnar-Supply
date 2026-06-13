import { Html, Head } from "@react-email/components";
import { EmailShell, E } from "./EmailShell";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://radnar.supply";

export default function Welcome({ name }: { name?: string | null }) {
  return (
    <Html>
      <Head />
      <EmailShell preview="Welcome to Radnar Supply — verified designer, below retail">
        <E.eyebrow>Welcome</E.eyebrow>
        <E.h1>{name ? `Hello, ${name}.` : "You're in."}</E.h1>
        <E.p>Hand-picked designer pieces. Authenticated in-house. Always below retail. Free UK delivery over £75.</E.p>
        <E.p>New drops every Friday. Follow us on Instagram for first look.</E.p>
        <E.button href={`${SITE}/shop`}>Start Shopping →</E.button>
      </EmailShell>
    </Html>
  );
}
