import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  DatabaseBackup,
  KeyRound,
  Layers,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Split,
  type LucideIcon,
} from "lucide-react";

import { useDemo } from "@/components/demo/DemoProvider";
import { Note, PageHeader, Panel, PitchNext, StatCard } from "@/components/demo/ui";
import { getBackupStats, getPreparation, getServicesView } from "@/lib/demo-state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Municipal Cyber Kit (démo)" },
      {
        name: "description",
        content:
          "Vue d'ensemble fictive de la continuité d'activité de la Mairie des Tilleuls : sauvegardes, services et incidents.",
      },
      { property: "og:title", content: "Tableau de bord — Municipal Cyber Kit (démo)" },
      {
        property: "og:description",
        content: "Vue d'ensemble fictive de la continuité d'activité d'une petite mairie.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type QuickPath = "/sauvegardes" | "/services" | "/incidents";

const QUICK: { to: QuickPath; label: string; hint: string; icon: LucideIcon; danger?: boolean }[] = [
  { to: "/sauvegardes", label: "Voir les sauvegardes", hint: "Copies et tests de reprise", icon: DatabaseBackup },
  { to: "/services", label: "Consulter les services", hint: "Priorité des applications", icon: Building2 },
  {
    to: "/incidents",
    label: "Simuler une cyberattaque",
    hint: "Parcours de crise fictif",
    icon: ShieldAlert,
    danger: true,
  },
];

const PRINCIPLES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Split, title: "Isolation par commune", text: "Les données de chaque mairie restent strictement séparées." },
  { icon: Lock, title: "Chiffrement", text: "Copies chiffrées, illisibles sans la clé de la commune." },
  { icon: KeyRound, title: "Copies séparées", text: "Sauvegardes isolées des systèmes locaux de la mairie." },
  { icon: Layers, title: "Ressources mutualisées", text: "Infrastructure partagée pour réduire coûts et empreinte." },
];

const PITCH: { to: "/" | "/sauvegardes" | "/incidents" | "/assistance"; label: string }[] = [
  { to: "/", label: "Tableau de bord" },
  { to: "/sauvegardes", label: "Sauvegardes" },
  { to: "/incidents", label: "Simuler une cyberattaque" },
  { to: "/incidents", label: "Vérification et validation de la reprise" },
  { to: "/incidents", label: "Services disponibles en secours" },
  { to: "/assistance", label: "Assistance IA et création d'un ticket" },
];

function Dashboard() {
  const { state } = useDemo();
  const backups = getBackupStats(state);
  const services = getServicesView(state);
  const prep = getPreparation(state);
  const status = state.incident.status;

  const ready = services.filter((s) => s.runtime === "pret").length;
  const inSecours = services.filter((s) => s.runtime === "secours").length;

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de la continuité d'activité de la commune"
      />

      <div className="mb-6">
        {status === "none" && (
          <Note tone="success" icon={<ShieldCheck />}>
            <strong>Situation normale.</strong> Aucun incident actif dans la démonstration.
          </Note>
        )}
        {status === "active" && (
          <Note tone="danger" icon={<ShieldAlert />}>
            <strong>Incident simulé en cours :</strong> suspicion de rançongiciel, fichiers
            indisponibles.{" "}
            <Link to="/incidents" className="font-semibold underline underline-offset-4">
              Suivre la procédure de reprise
            </Link>
          </Note>
        )}
        {status === "secours" && (
          <Note tone="success" icon={<ShieldCheck />}>
            <strong>Services essentiels disponibles en mode secours (simulation).</strong>{" "}
            <Link to="/incidents" className="font-semibold underline underline-offset-4">
              Clôturer l'incident simulé
            </Link>
          </Note>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Sauvegardes disponibles"
          value={`${backups.available} / ${backups.total}`}
          hint={
            backups.toVerify.length > 0
              ? `${backups.toVerify.length} copie à vérifier`
              : "Toutes vérifiées (simulation)"
          }
          tone="success"
        />
        <StatCard
          label="Services prioritaires prêts"
          value={
            status === "active"
              ? `0 / ${services.length}`
              : status === "secours"
                ? `${inSecours} / ${services.length}`
                : `${ready} / ${services.length}`
          }
          hint={
            status === "active"
              ? "Services interrompus"
              : status === "secours"
                ? "En mode secours · 1 hors secours"
                : `${services.length - ready} logiciel à préparer`
          }
          tone={status === "active" ? "danger" : "warning"}
        />
        <StatCard
          label="Incidents actifs"
          value={status === "active" ? "1" : "0"}
          hint={
            status === "active"
              ? "Suspicion de rançongiciel"
              : status === "secours"
                ? "Reprise en mode secours"
                : "Aucune alerte en cours"
          }
          tone={status === "active" ? "danger" : "info"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Panel
          className="lg:col-span-3"
          title="Préparation aux incidents"
          description="Suivi des actions essentielles de la mairie"
        >
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={prep.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Préparation complétée"
          >
            <div className="h-full rounded-full bg-success" style={{ width: `${prep.percent}%` }} />
          </div>
          <p className="mt-2 text-sm font-semibold text-success-strong">
            {prep.percent} % de la préparation complétée
          </p>
          <ul className="mt-4 space-y-3">
            {prep.items.map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-sm">
                {item.done ? (
                  <CircleCheck className="size-5 shrink-0 text-success" aria-label="Fait" />
                ) : (
                  <CircleAlert className="size-5 shrink-0 text-warning" aria-label="À faire" />
                )}
                <span className="flex-1">{item.label}</span>
                {!item.done && (
                  <Link
                    to="/sauvegardes"
                    className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Planifier
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="lg:col-span-2" title="Accès rapides">
          <ul className="space-y-3">
            {QUICK.map((q) => (
              <li key={q.label}>
                <Link
                  to={q.to}
                  className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted"
                >
                  <q.icon
                    className={q.danger ? "size-5 text-destructive" : "size-5 text-primary"}
                    aria-hidden="true"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{q.label}</span>
                    <span className="block text-xs text-muted-foreground">{q.hint}</span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Panel
          className="lg:col-span-3"
          title="Architecture envisagée"
          description="Principes de la solution cible — non déployés dans ce prototype"
        >
          <ul className="grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <li key={p.title} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-info-soft text-info-strong">
                  <p.icon className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{p.title}</span>
                  <span className="block text-xs text-muted-foreground">{p.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel
          className="lg:col-span-2"
          title="Parcours de démonstration"
          description="Environ 45 secondes pour le pitch"
        >
          <ol className="space-y-2 text-sm">
            {PITCH.map((p, i) => (
              <li key={p.label} className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-navy-foreground">
                  {i + 1}
                </span>
                <Link to={p.to} className="hover:text-primary hover:underline">
                  {p.label}
                </Link>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <PitchNext step={1} to="/sauvegardes" label="Sauvegardes" />
    </>
  );
}
