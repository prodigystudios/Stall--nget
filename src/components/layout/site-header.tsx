import Link from "next/link";
import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";

type SiteHeaderProps = {
  currentUserName?: string | null;
  isConfigured: boolean;
  sourceLabel: string;
};

export function SiteHeader({
  currentUserName,
  isConfigured,
  sourceLabel,
}: SiteHeaderProps) {
  return (
    <header className="rounded-[2rem] border border-border/80 bg-surface/90 p-6 shadow-[0_20px_70px_-40px_rgba(66,33,12,0.5)] sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted">Stall Änget</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Passkalender
            </h1>
            <StatusPill tone={isConfigured ? "success" : "warning"}>
              {sourceLabel}
            </StatusPill>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
            Här ser ni vald månad, vilka pass som är lediga och vem som har
            tagit ansvar för varje slot.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {currentUserName ? (
            <p className="text-sm text-muted">Inloggad som {currentUserName}</p>
          ) : (
            <p className="text-sm text-muted">Ingen aktiv användarsession hittades.</p>
          )}

          <Button asChild variant="secondary">
            <Link href="/">Översikt</Link>
          </Button>

          {currentUserName ? (
            <form action={signOutAction}>
              <Button type="submit" variant="ghost">
                Logga ut
              </Button>
            </form>
          ) : (
            <Button asChild>
              <Link href="/login">Logga in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}