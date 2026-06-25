"use server";
import { db } from "@/lib/prisma";
import { sourcingRequestSchema } from "@/lib/validators";
import { sendSourcingRequestAdmin, sendSourcingRequestConfirmation } from "@/lib/email";
import { allow, isBot } from "@/lib/security";

export type SourcingResult = { ok: true } | { ok: false; error: string };

export async function submitSourcingRequest(_: unknown, formData: FormData): Promise<SourcingResult> {
  try {
    if (isBot(formData)) return { ok: true }; // silently drop bots
    if (!(await allow("sourcing", 5, 60_000))) return { ok: false, error: "Too many requests — please try again shortly." };
    const data = sourcingRequestSchema.parse(Object.fromEntries(formData));

    let imageUrls: string[] = [];
    try {
      const parsed = JSON.parse(data.imageUrls);
      if (Array.isArray(parsed)) imageUrls = parsed.filter((u) => typeof u === "string").slice(0, 4);
    } catch { /* ignore malformed */ }

    const request = await db.sourcingRequest.create({
      data: {
        type: data.type,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        item: data.item,
        size: data.size || null,
        budget: data.budget || null,
        detail: data.detail || null,
        imageUrls: JSON.stringify(imageUrls),
      },
    });

    const payload = {
      id: request.id, type: data.type, name: data.name, email: data.email,
      phone: data.phone, item: data.item, size: data.size, budget: data.budget,
      detail: data.detail, imageUrls,
    };
    // Fire-and-forget emails — never block the user on mail delivery.
    sendSourcingRequestAdmin(payload).catch((e) => console.error("sourcing admin mail", e));
    sendSourcingRequestConfirmation(payload).catch((e) => console.error("sourcing confirm mail", e));

    return { ok: true };
  } catch (e: any) {
    console.error("submitSourcingRequest", e);
    const msg = e?.errors?.[0]?.message ?? e?.message ?? "Could not submit your request";
    return { ok: false, error: msg };
  }
}
