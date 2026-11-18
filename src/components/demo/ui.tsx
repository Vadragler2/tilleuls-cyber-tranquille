import { Link } from "@tanstack/react-router";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, Info } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  aside,
}: {
  title: string;
  subtitle: string;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {aside}
    </div>
  );
}

export const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      tone: {
        success: "border-success/30 bg-success-soft text-success-strong",
        warning: "border-warning/40 bg-warning-soft text-warning-strong",
        danger: "border-destructive/30 bg-destructive-soft text-destructive-strong",
        info: "border-primary/25 bg-info-soft text-info-strong",
        neutral: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type Tone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export function StatusBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={badgeVariants({ tone })}>{children}</span>;
}

const valueTone: Record<Tone, string> = {
  success: "text-success-strong",
  warning: "text-warning-strong",
  danger: "text-destructive-strong",
  info: "text-info-strong",
  neutral: "text-foreground",
};

export function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: Tone;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-3xl font-bold", valueTone[tone])}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border bg-card p-5 shadow-card md:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-bold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

const noteVariants = cva("flex gap-3 rounded-lg border p-3 text-sm", {
  variants: {
    tone: {
      info: "border-primary/20 bg-info-soft text-info-strong",
      warning: "border-warning/40 bg-warning-soft text-warning-strong",
      danger: "border-destructive/30 bg-destructive-soft text-destructive-strong",
      success: "border-success/30 bg-success-soft text-success-strong",
      neutral: "border-border bg-muted text-muted-foreground",
    },
  },
  defaultVariants: { tone: "info" },
});

export function Note({
  tone = "info",
  icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(noteVariants({ tone }), className)}>
      <span className="mt-0.5 shrink-0 [&_svg]:size-4" aria-hidden="true">
        {icon ?? <Info />}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

type PitchTarget = "/" | "/sauvegardes" | "/services" | "/incidents" | "/assistance";

/** Lien « suite du parcours » pour dérouler facilement la démonstration du pitch. */
export function PitchNext({ step, to, label }: { step: number; to: PitchTarget; label: string }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed bg-card/60 px-4 py-3 text-sm">
      <span className="text-muted-foreground">Parcours de démonstration · étape {step} sur 6</span>
      <Link
        to={to}
        className="inline-flex items-center gap-1.5 font-semibold text-primary underline-offset-4 hover:underline"
      >
        Suite : {label}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
