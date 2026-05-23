import Link from "next/link";
import { redirect } from "next/navigation";
import { signInAction, signUpAction } from "@/lib/auth/actions";
import { SignupModal } from "@/components/auth/signup-modal";
import { SetupCallout } from "@/components/layout/setup-callout";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const getValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function HorseHeadMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      className="h-10 w-10 text-[#e7d3be]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M46 8c-6 3-10 8-13 14-2 4-3 8-3 13v6c0 6-3 11-8 15"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M46 8c2 8 1 16-2 23 4 4 7 8 8 13 1 5-2 9-7 9-5 0-8-3-10-8l-2-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 10c-4 3-7 8-9 13"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M34 24c-4 3-7 7-8 12-1 5 0 10 2 15 2 4 5 8 8 11"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 19c3 4 8 6 14 6 4 0 7-1 10-3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M23 18c-6 3-10 8-12 13-2 7-2 14 2 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 24c-3 3-6 7-6 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M13 47c2 4 5 7 9 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M37 30c2-1 4-1 6 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M37 34c2 1 4 1 6 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M45 43c2 0 4 1 5 3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M40 45c1 4 4 7 8 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M42 17c4 2 7 5 9 9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M35 12c2 3 5 5 8 5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="41" cy="30" r="2.25" fill="currentColor" />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status = getValue(params.status);
  const error = getValue(params.error);

  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

    if (user) {
      redirect("/kalender");
    }
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <section className="rounded-[2rem] border border-border/80 bg-[#3b2415] p-8 text-[#f8efe5] shadow-[0_20px_70px_-35px_rgba(33,14,4,0.8)] sm:p-10 lg:sticky lg:top-10">
          <div className="flex items-center gap-3 text-[#d8c3ae]">
            <HorseHeadMark />
            <p className="text-sm uppercase tracking-[0.3em]">Stall Änget</p>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Logga in och boka månadens pass.
          </h1>
          <p className="mt-5 text-base leading-8 text-[#f1e4d4] sm:text-lg">
            Se morgon- och kvällspass, boka det som passar dig och få en snabb
            överblick över månaden.
          </p>
        </section>

        <section className="rounded-[2rem] border border-border/80 bg-surface/95 p-8 shadow-[0_20px_70px_-40px_rgba(66,33,12,0.45)] sm:p-10">
          <div className="max-w-2xl">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted">Inloggning</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Välkommen tillbaka
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">
                Logga in för att se månaden och boka de pass som passar dig.
              </p>
            </div>
            <Button asChild variant="ghost" className="mt-3 -ml-3 w-fit">
              <Link href="/">Till startsidan</Link>
            </Button>
          </div>

          {status ? (
            <div className="mt-6 rounded-[1.5rem] border border-[#b4c9ae] bg-[#e1f0de] px-4 py-3 text-sm text-[#32522b]">
              {status}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-[1.5rem] border border-[#d5aaa1] bg-[#f0d8d1] px-4 py-3 text-sm text-[#7a3126]">
              {error}
            </div>
          ) : null}

          {isSupabaseConfigured ? (
            <div className="mt-8 space-y-5">
              <form action={signInAction} className="space-y-5 rounded-[1.75rem] border border-border/80 bg-white/70 p-6 sm:p-7">
                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.03em]">Logga in</h3>
                  <p className="mt-2 text-sm leading-7 text-muted sm:text-base">
                    Ange din e-post och ditt lösenord för att fortsätta till kalendern.
                  </p>
                </div>

                <label className="block text-sm font-medium text-foreground">
                  E-post
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-white px-4 text-base outline-none transition focus:border-accent"
                    placeholder="namn@stallanget.se"
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  Lösenord
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-white px-4 text-base outline-none transition focus:border-accent"
                    placeholder="••••••••"
                    required
                  />
                </label>

                <Button type="submit" size="lg" className="w-full">
                  Logga in
                </Button>
              </form>

              <div className="rounded-[1.75rem] border border-dashed border-border bg-[#f7efe6]/75 p-6">
                <div className="max-w-2xl">
                  <p className="text-sm uppercase tracking-[0.2em] text-muted">Nytt konto</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                    Saknar du konto?
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">
                    Skapa ett konto med namn, e-post och lösenord i ett eget fönster.
                  </p>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">
                    Du kan behöva verifiera din e-post innan första inloggningen. Kontrollera gärna även skräpposten.
                  </p>
                </div>

                <div className="mt-5">
                  <SignupModal action={signUpAction} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              <SetupCallout
                title="Kalendern är redo att användas"
                description="Om inloggningen inte är aktiverad ännu går det fortfarande att öppna kalendern och se upplägget för månaden."
              />
              <Button asChild size="lg" className="w-full">
                <Link href="/kalender">Öppna kalendern</Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}