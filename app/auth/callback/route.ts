import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const type = searchParams.get("type");
    const rawNext = searchParams.get("next");
    const isRelative = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//");
    const next = isRelative ? rawNext : "/dashboard";

    if (code) {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // If this is a password recovery flow, redirect to reset page
            if (type === "recovery") {
                return NextResponse.redirect(`${origin}/auth/reset-password`);
            }
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Auth code error — redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
