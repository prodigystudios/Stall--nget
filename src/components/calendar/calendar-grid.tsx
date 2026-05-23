import type { CalendarDay } from "@/lib/calendar";
import { BookingCard } from "@/components/calendar/booking-card";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";

type CalendarGridProps = {
  days: CalendarDay[];
  disabled: boolean;
  monthKey: string;
};

const getDayAnchorId = (isoDate: string) => `day-${isoDate}`;

export function CalendarGrid({ days, disabled, monthKey }: CalendarGridProps) {
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      {days.map((day) => (
        <article
          key={day.isoDate}
          id={getDayAnchorId(day.isoDate)}
          className={cn(
            "relative scroll-mt-32 rounded-[2rem] border border-border/80 bg-surface/90 p-5 shadow-[0_20px_70px_-50px_rgba(66,33,12,0.55)]",
            day.isSpecialDate && "bg-[linear-gradient(180deg,rgba(255,247,236,0.98),rgba(255,250,244,0.92))] border-accent/35 shadow-[0_20px_70px_-50px_rgba(143,92,56,0.45)]",
          )}
        >
          <div className="flex min-h-32 items-start justify-between gap-4">
            <div className="min-h-24">
              <p className="text-sm uppercase tracking-[0.24em] text-muted">
                {day.title}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] capitalize">
                {day.subtitle}
              </h2>
              <div className="mt-3 min-h-8">
                {day.isSpecialDate ? (
                  <StatusPill tone="warning">{day.specialDateLabel}</StatusPill>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {day.isSpecialDate ? <StatusPill tone="dark">Helgdag</StatusPill> : null}
              {day.isToday ? (
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  Idag
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {day.slots.map((slot) => (
              <BookingCard
                key={`${day.isoDate}-${slot.id}`}
                slot={slot}
                disabled={disabled}
                monthKey={monthKey}
              />
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}