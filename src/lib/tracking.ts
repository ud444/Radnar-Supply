/** Build a public tracking URL from a carrier + number, or pass through an explicit URL. */
const CARRIERS: Record<string, { label: string; url: (n: string) => string }> = {
  royalmail: { label: "Royal Mail", url: (n) => `https://www.royalmail.com/track-your-item#/tracking-results/${n}` },
  dpd:       { label: "DPD",        url: (n) => `https://track.dpd.co.uk/parcels/${n}` },
  evri:      { label: "Evri",       url: (n) => `https://www.evri.com/track/parcel/${n}` },
  dhl:       { label: "DHL",        url: (n) => `https://www.dhl.com/gb-en/home/tracking.html?tracking-id=${n}` },
  ups:       { label: "UPS",        url: (n) => `https://www.ups.com/track?tracknum=${n}` },
  fedex:     { label: "FedEx",      url: (n) => `https://www.fedex.com/fedextrack/?trknbr=${n}` },
   parcelforce: { label: "Parcelforce", url: (n) => `https://www.parcelforce.com/track-trace?trackNumber=${n}` },
};

export const CARRIER_OPTIONS = Object.entries(CARRIERS).map(([value, c]) => ({ value, label: c.label }));

/** Returns the best tracking URL: explicit URL wins, else a carrier-built link, else null. */
export function trackingLink(carrier?: string | null, number?: string | null, explicitUrl?: string | null): string | null {
  if (explicitUrl && explicitUrl.trim()) return explicitUrl.trim();
  const c = carrier ? CARRIERS[carrier.toLowerCase()] : null;
  if (c && number && number.trim()) return c.url(number.trim());
  return null;
}
