/**
 * Footer payment marks. Inline SVGs (no external requests) inside uniform
 * white chips so the brand colours read cleanly against the dark footer.
 * Order follows the brief: Visa, Mastercard, Klarna, Apple Pay, Google Pay,
 * Amazon Pay, PayPal.
 */

function Chip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-11 items-center justify-center rounded-[5px] bg-white ring-1 ring-black/5 shadow-sm"
    >
      {children}
    </span>
  );
}

function Visa() {
  return (
    <svg viewBox="0 0 48 16" className="h-3 w-auto" aria-hidden="true">
      <text
        x="24"
        y="13"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontStyle="italic"
        fontSize="15"
        letterSpacing="0.5"
        fill="#1A1F71"
      >
        VISA
      </text>
    </svg>
  );
}

function Mastercard() {
  return (
    <svg viewBox="0 0 40 24" className="h-4 w-auto" aria-hidden="true">
      <circle cx="16" cy="12" r="10" fill="#EB001B" />
      <circle cx="26" cy="12" r="10" fill="#F79E1B" />
      <path
        d="M21 4.2a10 10 0 0 0 0 15.6 10 10 0 0 0 0-15.6Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function Klarna() {
  return (
    <span className="flex h-4 items-center rounded-[3px] bg-[#FFB3C7] px-1">
      <span className="text-[9px] font-bold leading-none text-black">Klarna</span>
    </span>
  );
}

function ApplePay() {
  return (
    <svg viewBox="0 0 40 18" className="h-3.5 w-auto" aria-hidden="true">
      <path
        d="M7.4 3.6c.5-.6.8-1.4.7-2.2-.7 0-1.6.5-2.1 1.1-.5.5-.9 1.4-.7 2.2.8 0 1.6-.4 2.1-1.1Zm.7 1.2c-1.2-.1-2.2.7-2.7.7-.6 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.8-1.2 2.1-.3 5.3.9 7 .6.8 1.3 1.8 2.2 1.7.9 0 1.2-.6 2.3-.6s1.4.6 2.3.5c1 0 1.6-.8 2.2-1.7.4-.6.6-.9.9-1.6-2.3-.9-2.7-4.2-.4-5.5-.7-1-1.8-1.4-2.7-1.4Z"
        fill="#000"
      />
      <text x="15" y="13" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="11" fill="#000">
        Pay
      </text>
    </svg>
  );
}

function GooglePay() {
  return (
    <svg viewBox="0 0 44 18" className="h-3.5 w-auto" aria-hidden="true">
      <path d="M8.6 9.1v3.4H7.5V4.1h2.9c.7 0 1.3.2 1.8.7.5.4.7 1 .7 1.6s-.2 1.2-.7 1.6c-.5.5-1.1.7-1.8.7H8.6Zm0-4v3h1.8c.4 0 .8-.1 1-.4.3-.3.4-.6.4-1s-.1-.7-.4-1c-.2-.3-.6-.4-1-.4H8.6Z" fill="#5F6368" />
      <path d="M15.6 6.3c.8 0 1.4.2 1.9.6.5.4.7 1 .7 1.8v3.8h-1v-.8h-.1c-.4.7-1 1-1.8 1-.6 0-1.2-.2-1.6-.6-.4-.3-.6-.8-.6-1.3 0-.6.2-1 .6-1.4.4-.3 1-.5 1.8-.5.6 0 1.2.1 1.6.4v-.3c0-.4-.2-.7-.5-1-.3-.2-.7-.4-1.1-.4-.6 0-1.1.3-1.5.8l-1-.6c.5-.9 1.3-1.3 2.4-1.3Zm-1.4 4.3c0 .3.1.5.4.7.2.2.5.3.8.3.5 0 .9-.2 1.3-.5.4-.4.6-.8.6-1.2-.4-.3-.9-.4-1.5-.4-.5 0-.9.1-1.2.3-.3.2-.4.5-.4.8Z" fill="#5F6368" />
      <path d="m24.5 6.5-3.7 8.5h-1.1l1.4-3-2.4-5.5h1.2l1.7 4.2h.1l1.7-4.2h1.1Z" fill="#5F6368" />
      <path d="M32.6 8.6c0-.3 0-.6-.1-.9h-4.3v1.7h2.5c-.1.6-.4 1.1-.9 1.4v1.2h1.5c.9-.8 1.4-2 1.4-3.4Z" fill="#4285F4" />
      <path d="M28.2 13c1.2 0 2.2-.4 3-1.1l-1.5-1.2c-.4.3-.9.4-1.5.4-1.1 0-2.1-.8-2.4-1.8h-1.5v1.2c.7 1.5 2.2 2.5 3.9 2.5Z" fill="#34A853" />
      <path d="M25.8 9.3c-.2-.5-.2-1.1 0-1.7V6.4h-1.5c-.6 1.3-.6 2.7 0 3.9l1.5-1Z" fill="#FBBC04" />
      <path d="M28.2 5.8c.6 0 1.2.2 1.6.6l1.3-1.3c-.8-.7-1.8-1.1-2.9-1.1-1.7 0-3.2 1-3.9 2.4l1.5 1.2c.3-1 1.3-1.8 2.4-1.8Z" fill="#EA4335" />
    </svg>
  );
}

function AmazonPay() {
  return (
    <svg viewBox="0 0 46 18" className="h-3.5 w-auto" aria-hidden="true">
      <text x="1" y="10" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="9" fill="#232F3E">
        amazon
      </text>
      <text x="1" y="17" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="7" fill="#FF9900">
        pay
      </text>
      <path d="M30 15.5c3 1.8 6.5 1.8 9.5 0" stroke="#FF9900" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function PayPal() {
  return (
    <svg viewBox="0 0 48 16" className="h-3 w-auto" aria-hidden="true">
      <text x="24" y="12" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontStyle="italic" fontSize="11">
        <tspan fill="#003087">Pay</tspan>
        <tspan fill="#009CDE">Pal</tspan>
      </text>
    </svg>
  );
}

export function PaymentIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <Chip label="Visa"><Visa /></Chip>
      <Chip label="Mastercard"><Mastercard /></Chip>
      <Chip label="Klarna"><Klarna /></Chip>
      <Chip label="Apple Pay"><ApplePay /></Chip>
      <Chip label="Google Pay"><GooglePay /></Chip>
      <Chip label="Amazon Pay"><AmazonPay /></Chip>
      <Chip label="PayPal"><PayPal /></Chip>
    </div>
  );
}
