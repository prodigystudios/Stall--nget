"use client";

import { claimDutyAction, releaseDutyAction } from "@/app/kalender/actions";
import type { CalendarSlot } from "@/lib/calendar";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";

const CALENDAR_SCROLL_KEY = "stall-anget-calendar-scroll";

const colorClassMap: Record<string, string> = {
  amber: "from-[#fff0d9] to-[#f0d0a0]",
  sage: "from-[#ebf0df] to-[#c9d2b0]",
  clay: "from-[#f4dfd5] to-[#dab59f]",
  night: "from-[#e2e2ef] to-[#bdc0db]",
};

type BookingCardProps = {
  slot: CalendarSlot;
  disabled: boolean;
  monthKey: string;
};

export function BookingCard({ slot, disabled, monthKey }: BookingCardProps) {
  const persistScrollPosition = () => {
    window.sessionStorage.setItem(CALENDAR_SCROLL_KEY, String(window.scrollY));
  };

  const statusTone = slot.isMine
    ? "success"
    : slot.isBooked
      ? "danger"
      : "warning";

  const statusLabel = slot.isMine
    ? "Mitt pass"
    : slot.isBooked
      ? "Upptaget"
      : "Ledigt";

  return (
    <article
      className={cn(
        "rounded-[1.5rem] border border-border/70 bg-white/75 p-4 shadow-[0_10px_40px_-28px_rgba(66,33,12,0.45)]",
        slot.isMine && "ring-1 ring-[#97b38a]",
      )}
    >
      <div
        className={cn(
          "h-2 rounded-full bg-gradient-to-r",
          colorClassMap[slot.colorToken] ?? colorClassMap.amber,
        )}
      />

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.03em]">{slot.label}</h3>
        </div>
        <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
      </div>

      <div className="mt-5 rounded-[1.25rem] bg-[#f7efe6] px-4 py-3 text-sm text-muted">
        {slot.isBooked
          ? `Bokad av ${slot.assigneeName ?? "någon i stallet"}.`
          : "Ingen har tagit passet ännu."}
      </div>

      <div className="mt-5">
        {slot.isMine ? (
          <form action={releaseDutyAction} onSubmit={persistScrollPosition}>
            <input type="hidden" name="slotDefinitionId" value={slot.id} />
            <input type="hidden" name="dutyDate" value={slot.dutyDate} />
            <input type="hidden" name="month" value={monthKey} />
            <Button type="submit" variant="secondary" className="w-full" disabled={disabled}>
              Avboka mitt pass
            </Button>
          </form>
        ) : slot.isBooked ? (
          <Button type="button" variant="ghost" className="w-full" disabled>
            Redan bokat
          </Button>
        ) : (
          <form action={claimDutyAction} onSubmit={persistScrollPosition}>
            <input type="hidden" name="slotDefinitionId" value={slot.id} />
            <input type="hidden" name="dutyDate" value={slot.dutyDate} />
            <input type="hidden" name="month" value={monthKey} />
            <Button type="submit" className="w-full" disabled={disabled}>
              Ta passet
            </Button>
          </form>
        )}
      </div>
    </article>
  );
}