import { siteUrl } from "./url";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Plain-HTML version of the branded email shell, for mail composed at runtime
 * in the admin rather than from a React Email template. Inline styles only —
 * mail clients strip <style> blocks and ignore most modern CSS.
 */
export function renderShell(args: {
  heading: string;
  body: string;          // one paragraph per line
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const paragraphs = args.body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 14px">${esc(p)}</p>`)
    .join("");

  const cta = args.ctaLabel
    ? `<a href="${esc(args.ctaHref || `${siteUrl()}/shop`)}"
          style="display:inline-block;margin-top:8px;background:#FF4D00;color:#ffffff;
                 padding:14px 26px;font-weight:700;letter-spacing:1px;text-transform:uppercase;
                 text-decoration:none;border-radius:10px;font-size:12px">${esc(args.ctaLabel)} &rarr;</a>`
    : "";

  return `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background:#ffffff">
  <div style="background:#0A0A0A;color:#ffffff;padding:18px 22px;font-weight:800;
              letter-spacing:1px;text-transform:uppercase;font-size:14px">${esc(args.heading)}</div>
  <div style="border:1px solid #eeeeee;border-top:none;padding:22px;color:#0A0A0A;
              font-size:15px;line-height:1.7">
    ${paragraphs}
    ${cta}
    <p style="margin-top:24px;color:#888888;font-size:12px">&mdash; Radnar Supply</p>
  </div>
</div>`;
}
