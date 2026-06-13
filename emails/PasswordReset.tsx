import { Html, Head } from "@react-email/components";
import { EmailShell, E } from "./EmailShell";

export default function PasswordReset({ link }: { link: string }) {
  return (
    <Html>
      <Head />
      <EmailShell preview="Reset your Radnar Supply password">
        <E.eyebrow>Reset Password</E.eyebrow>
        <E.h1>Pick a new one.</E.h1>
        <E.p>Tap the button below to set a new password. The link expires in one hour.</E.p>
        <E.button href={link}>Reset Password →</E.button>
        <E.hr />
        <E.p style={{ fontSize: 12 }}>Didn't request this? You can ignore the email — your password stays as it was.</E.p>
      </EmailShell>
    </Html>
  );
}
