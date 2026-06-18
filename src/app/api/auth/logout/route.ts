import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";
import { siteUrl } from "@/lib/url";

export async function POST() {
  await destroySession();
  return NextResponse.redirect(new URL("/", siteUrl()));
}
