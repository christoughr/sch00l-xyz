import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

async function destinationAfterAuth(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  next: string,
  origin: string
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let destination = next;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .single();
    if (!profile?.onboarding_complete) {
      destination = "/onboarding";
    }
  }
  return `${origin}${destination.startsWith("/") ? destination : "/study"}`;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/study";

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    });
    if (!error) {
      return NextResponse.redirect(
        await destinationAfterAuth(supabase, next, origin)
      );
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(
        await destinationAfterAuth(supabase, next, origin)
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
