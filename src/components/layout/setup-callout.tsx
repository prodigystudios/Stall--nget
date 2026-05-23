import { StatusPill } from "@/components/ui/status-pill";

type SetupCalloutProps = {
  title: string;
  description: string;
};

export function SetupCallout({ title, description }: SetupCalloutProps) {
  return (
    <aside className="rounded-[1.75rem] border border-dashed border-border bg-white/70 p-6">
      <StatusPill tone="warning">Setup</StatusPill>
      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-muted sm:text-base">{description}</p>
    </aside>
  );
}