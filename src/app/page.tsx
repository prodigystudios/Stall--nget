import Link from "next/link";
import { redirect } from "next/navigation";
import { SetupCallout } from "@/components/layout/setup-callout";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const highlights = [
  {
    title: "Månadsvy med tydliga bokningsdagar",
    body: "Kalendern visar månaden men bara de dagar där pass faktiskt ska bokas: fredag till söndag samt röda dagar och högtider.",
  },
  {
    title: "Boka dig själv på några sekunder",
    body: "Varje pass kan bokas eller avbokas direkt i kalendern, med skydd mot dubbelbokning på databasnivå.",
  },
  {
    title: "Enkel att använda i vardagen",
    body: "Fokus ligger på att snabbt se vem som tar morgon eller kväll, utan onödiga steg eller extra administration.",
  },
];

export default async function Home() {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

    if (user) {
      redirect("/kalender");
    }

    redirect("/login");
  }

  return (
    <main className="relative flex min-h-full flex-1 flex-col overflow-hidden px-6 py-8 text-foreground sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(255,250,244,0.96),transparent_62%)]" />

      <section className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="rounded-[2rem] border border-border/80 bg-surface/95 p-8 shadow-[0_24px_80px_-40px_rgba(66,33,12,0.45)] sm:p-10">
            <p className="text-sm uppercase tracking-[0.32em] text-muted">
              Stall Änget
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Boka stallpass utan att jaga folk i gruppchatten.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
              Här ser ni månadens morgon- och kvällspass, bokar det som passar
              och får en snabb överblick över vem som tar vad.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/login">Gå till inloggning</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/kalender">Visa kalendern</Link>
              </Button>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.5rem] border border-border/70 bg-white/70 p-5"
                >
                  <h2 className="text-lg font-semibold tracking-[-0.02em]">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-border/80 bg-[#3b2415] p-8 text-[#f7efe6] shadow-[0_24px_80px_-40px_rgba(33,14,4,0.7)]">
              <p className="text-sm uppercase tracking-[0.26em] text-[#d9c4b0]">
                V1 i korthet
              </p>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-[#f3e7d9] sm:text-base">
                <li>Kalendern visar morgon och kväll för bokningsbara dagar i månaden.</li>
                <li>Alla inloggade kan boka sig själva och avboka sina egna pass.</li>
                <li>Varje pass kan bara bokas av en person åt gången.</li>
                <li>Överblicken är gjord för att fungera snabbt i vardagen.</li>
              </ul>
            </div>

            <SetupCallout
              title="Enkel överblick från start"
              description="Startsidan skickar vidare till inloggning eller kalender beroende på om användaren redan har en aktiv session."
            />
          </div>
        </div>
      </section>
    </main>
  );
}
