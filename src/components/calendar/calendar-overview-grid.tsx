import Link from "next/link";
import type { CalendarDay } from "@/lib/calendar";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";

type CalendarOverviewGridProps = {
  days: CalendarDay[];
  monthKey: string;
};

const getDayAnchorId = (isoDate: string) => `day-${isoDate}`;

const getSlotShortLabel = (slug: string) => (slug === "kvall" ? "K" : "M");

const getAssigneeMark = (name: string | null) => {
  if (!name) {
    return "B";
  }

  return name.trim().charAt(0).toUpperCase();
};

const getMobileSlotText = (name: string | null, isMine: boolean, isBooked: boolean) => {
  if (isMine) {
    return "Du";
  }

  if (!isBooked) {
    return "Ledig";
  }

  if (!name) {
    return "Bokad";
  }

  const shortName = name.trim().split(/\s+/)[0] ?? name.trim();
  return shortName.slice(0, 5);
};

const getMobileSlotIndicatorClass = (isMine: boolean, isBooked: boolean) =>
  isMine
    ? "border-[#b4c9ae] bg-[#e1f0de] text-[#32522b]"
    : isBooked
      ? "border-[#d5aaa1] bg-[#f0d8d1] text-[#7a3126]"
      : "border-[#dcc49f] bg-[#f6e8ca] text-[#7b5821]";

export function CalendarOverviewGrid({ days, monthKey }: CalendarOverviewGridProps) {
  return (
    <>
      <section className="sm:hidden">
        <div className="grid grid-cols-3 gap-2.5">
          {days.map((day) => {
            const dayNumber = Number(day.isoDate.slice(-2));

            return (
              <Link
                key={day.isoDate}
                href={`/kalender?month=${monthKey}&view=booking#${getDayAnchorId(day.isoDate)}`}
                className={cn(
                  "flex aspect-square flex-col rounded-[1rem] border border-border/70 bg-white/85 p-2 shadow-[0_10px_30px_-28px_rgba(66,33,12,0.45)] transition hover:border-accent/50 hover:bg-[#fffaf3]",
                  day.isSpecialDate && "border-accent/45 bg-[#fff4e6]",
                  day.isToday && "ring-1 ring-accent/50",
                )}
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <p className="text-[0.56rem] font-semibold uppercase tracking-[0.08em] text-muted">
                      {day.title.slice(0, 3)}
                    </p>
                    <span className="mt-0.5 block text-base font-semibold text-foreground">
                      {dayNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {day.isSpecialDate ? <span className="h-1.5 w-1.5 rounded-full bg-[#c18a2d]" /> : null}
                    {day.isToday ? <span className="h-1.5 w-1.5 rounded-full bg-accent" /> : null}
                  </div>
                </div>

                <div className="mt-2 flex flex-1 flex-col justify-end gap-1.5">
                  {day.slots.map((slot) => (
                    <div key={`${day.isoDate}-${slot.id}`} className="flex items-center justify-between gap-1.5">
                      <span className="text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-muted">
                        {getSlotShortLabel(slot.slug)}
                      </span>
                      <span
                        className={cn(
                          "inline-flex min-w-0 max-w-[3.5rem] items-center justify-center rounded-full border px-2 py-0.5 text-[0.52rem] font-semibold uppercase tracking-[0.04em]",
                          getMobileSlotIndicatorClass(slot.isMine, slot.isBooked),
                        )}
                      >
                        <span className="truncate">
                          {getMobileSlotText(slot.assigneeName, slot.isMine, slot.isBooked)}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="hidden grid-cols-2 items-start gap-3 sm:grid lg:grid-cols-3 2xl:grid-cols-4">
        {days.map((day) => (
          <article
            key={day.isoDate}
            className={cn(
              "flex min-h-[220px] flex-col rounded-[1.5rem] border border-border/80 bg-surface/90 p-4 shadow-[0_20px_55px_-50px_rgba(66,33,12,0.55)]",
              day.isSpecialDate &&
                "border-accent/35 bg-[linear-gradient(180deg,rgba(255,247,236,0.98),rgba(255,250,244,0.92))] shadow-[0_20px_70px_-50px_rgba(143,92,56,0.45)]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted">{day.title}</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.05em] capitalize">
                  {day.subtitle}
                </h2>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {day.isSpecialDate ? <StatusPill tone="dark">Helgdag</StatusPill> : null}
                {day.isToday ? (
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    Idag
                  </span>
                ) : null}
              </div>
            </div>

            {day.isSpecialDate ? (
              <div className="mt-2">
                <div className="rounded-full border border-[#dcc49f] bg-[#f6e8ca] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7b5821]">
                  {day.specialDateLabel}
                </div>
              </div>
            ) : null}

            <div className="mt-3 flex flex-1 flex-col gap-2">
              {day.slots.map((slot) => {
                const tone = slot.isMine ? "success" : slot.isBooked ? "danger" : "warning";
                const status = slot.isMine ? "Mitt pass" : slot.isBooked ? "Upptaget" : "Ledigt";
                const href = `/kalender?month=${monthKey}&view=booking#${getDayAnchorId(day.isoDate)}`;

                return (
                  <Link
                    key={`${day.isoDate}-${slot.id}`}
                    href={href}
                    className={cn(
                      "flex flex-1 flex-col justify-between rounded-[1.1rem] border border-border/70 bg-white/75 px-3 py-3 shadow-[0_10px_32px_-28px_rgba(66,33,12,0.4)]",
                      "transition hover:border-accent/50 hover:bg-[#fffaf3] hover:shadow-[0_16px_40px_-30px_rgba(107,66,38,0.45)]",
                      slot.isMine && "ring-1 ring-[#97b38a]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold tracking-[-0.03em]">{slot.label}</h3>
                        <p className="mt-1 text-sm text-muted">
                          {slot.isBooked
                            ? `Bokad av ${slot.assigneeName ?? "någon i stallet"}.`
                            : "Ingen bokning ännu."}
                        </p>
                      </div>
                      <StatusPill tone={tone}>{status}</StatusPill>
                    </div>
                  </Link>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
