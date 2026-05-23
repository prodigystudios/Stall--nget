import { cn } from "@/lib/utils";

const toneClasses = {
  neutral: "bg-white/75 text-muted border border-border/80",
  success: "bg-[#e1f0de] text-[#32522b] border border-[#b4c9ae]",
  warning: "bg-[#f6e8ca] text-[#7b5821] border border-[#dcc49f]",
  danger: "bg-[#f0d8d1] text-[#7a3126] border border-[#d5aaa1]",
  dark: "bg-[#2f3146] text-white border border-[#474962]",
} as const;

type StatusPillProps = {
  tone?: keyof typeof toneClasses;
  children: React.ReactNode;
};

export function StatusPill({ tone = "neutral", children }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}