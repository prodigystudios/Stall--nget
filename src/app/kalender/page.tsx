import Link from "next/link";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarScrollRestorer } from "@/components/calendar/calendar-scroll-restorer";
import { SetupCallout } from "@/components/layout/setup-callout";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { getCalendarViewModel } from "@/lib/calendar";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const getValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status = getValue(params.status);
  const error = getValue(params.error);
  const month = getValue(params.month);
  const viewModel = await getCalendarViewModel(month);

  const totalSlots = viewModel.days.reduce((sum, day) => sum + day.slots.length, 0);
  const openSlots = viewModel.days.reduce(
    (sum, day) => sum + day.slots.filter((slot) => !slot.isBooked).length,
    0,
  );
  const mySlots = viewModel.days.reduce(
    (sum, day) => sum + day.slots.filter((slot) => slot.isMine).length,
    0,
  );

  return (
    <main className="flex min-h-full flex-1 flex-col px-6 py-8 sm:px-10 lg:px-16">
      <CalendarScrollRestorer />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
        <SiteHeader
          currentUserName={viewModel.currentUser?.displayName ?? null}
          isConfigured={viewModel.isConfigured}
          sourceLabel={viewModel.currentUser ? "Aktiv" : "Kalender"}
        />

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div className="rounded-[1.75rem] border border-border/80 bg-surface/90 p-5">
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Överblick</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
              {viewModel.monthLabel}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
              Vyn visar månadens morgon- och kvällspass för fredag till söndag
              samt röda dagar och högtider som lagts in i databasen.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href={`/kalender?month=${viewModel.previousMonthKey}`}>Föregående månad</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/kalender?month=${viewModel.nextMonthKey}`}>Nästa månad</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border/80 bg-white/80 p-5">
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Totalt</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.06em]">{totalSlots}</p>
            <p className="mt-2 text-sm text-muted">slotar i vyn</p>
          </div>

          <div className="rounded-[1.75rem] border border-border/80 bg-white/80 p-5">
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Lediga</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.06em]">{openSlots}</p>
            <p className="mt-2 text-sm text-muted">pass att boka</p>
          </div>

          <div className="rounded-[1.75rem] border border-border/80 bg-white/80 p-5">
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Mina</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.06em]">{mySlots}</p>
            <p className="mt-2 text-sm text-muted">bokade pass</p>
          </div>
        </section>

        {status ? (
          <div className="rounded-[1.5rem] border border-[#b4c9ae] bg-[#e1f0de] px-4 py-3 text-sm text-[#32522b]">
            {status}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[1.5rem] border border-[#d5aaa1] bg-[#f0d8d1] px-4 py-3 text-sm text-[#7a3126]">
            {error}
          </div>
        ) : null}

        {viewModel.notices.map((notice) => (
          <SetupCallout
            key={notice}
            title="Kalenderöversikt"
            description={notice}
          />
        ))}

        <div className="flex flex-wrap gap-3">
          <StatusPill tone="warning">Ledigt</StatusPill>
          <StatusPill tone="success">Mitt pass</StatusPill>
          <StatusPill tone="danger">Upptaget</StatusPill>
          <StatusPill tone="dark">Månadsvy</StatusPill>
        </div>

        <CalendarGrid
          days={viewModel.days}
          disabled={!viewModel.currentUser}
          monthKey={viewModel.monthKey}
        />
      </div>
    </main>
  );
}