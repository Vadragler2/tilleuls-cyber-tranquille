import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  DatabaseBackup,
  LayoutDashboard,
  MessageSquareText,
  RotateCcw,
  ShieldAlert,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { COMMUNE } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

import { useDemo } from "./DemoProvider";
import { ResetDemoDialog } from "./ResetDemoDialog";

type NavPath = "/" | "/sauvegardes" | "/services" | "/incidents" | "/assistance";

const NAV: { to: NavPath; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/sauvegardes", label: "Sauvegardes", icon: DatabaseBackup },
  { to: "/services", label: "Services", icon: Building2 },
  { to: "/incidents", label: "Mode crise", icon: ShieldAlert },
  { to: "/assistance", label: "Assistance IA", icon: MessageSquareText },
];

export function LimitsDialog({ trigger }: { trigger: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Limites de la simulation</DialogTitle>
          <DialogDescription>
            Prototype réalisé pour un exercice entrepreneurial DEI. Ce n'est pas un produit en
            service.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Aucun serveur, cloud, annuaire, outil de sauvegarde ou logiciel municipal n'est
              connecté.
            </li>
            <li>Aucune sauvegarde n'est réellement créée, contrôlée ou restaurée.</li>
            <li>Aucun bouton n'envoie de commande ni ne modifie un système extérieur.</li>
            <li>L'assistant donne des réponses pré-écrites : aucune IA n'est active.</li>
            <li>Les tickets et contacts techniciens sont fictifs : rien n'est envoyé.</li>
            <li>
              La reprise des logiciels métiers dépend de leur compatibilité : aucun basculement
              universel n'est promis.
            </li>
          </ul>
          <div>
            <h3 className="font-semibold">Données et sobriété</h3>
            <p className="mt-1 text-muted-foreground">
              Aucune donnée saisie n'est envoyée à un serveur. Les incidents et tickets restent dans
              la session de l'onglet. Les contacts et exercices du kit d'urgence sont conservés
              localement dans ce navigateur jusqu'à leur réinitialisation. La version publiée peut
              émettre des événements d'usage propres à l'hébergeur.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Architecture envisagée (non déployée)</h3>
            <p className="mt-1 text-muted-foreground">
              Ressources cloud mutualisées entre communes, avec isolation stricte des données de
              chaque mairie, chiffrement et copies de secours séparées des systèmes locaux.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { state } = useDemo();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const incidentOn = state.incident.status !== "none";
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-card focus:px-3 focus:py-2"
      >
        Aller au contenu
      </a>
      <header className="bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-3 rounded-md">
            <span
              className="grid size-9 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
              aria-hidden="true"
            >
              M
            </span>
            <span>
              <span className="block text-lg font-bold leading-tight">Municipal Cyber Kit</span>
              <span className="block text-xs text-navy-muted">
                Espace mairie · {COMMUNE.name} (fictif) · {COMMUNE.population}
              </span>
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <LimitsDialog
              trigger={
                <button
                  type="button"
                  className="rounded-md bg-navy-foreground px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-navy hover:bg-navy-foreground/90"
                >
                  Démonstration — données fictives
                </button>
              }
            />
            <ResetDemoDialog
              trigger={
                <Button variant="onNavy" size="sm">
                  <RotateCcw aria-hidden="true" />
                  Réinitialiser la démo
                </Button>
              }
            />
          </div>
        </div>
      </header>

      {incidentOn && (
        <div
          role="status"
          className={cn(
            "border-b text-sm",
            state.incident.status === "active"
              ? "border-destructive/30 bg-destructive-soft text-destructive-strong"
              : "border-success/30 bg-success-soft text-success-strong",
          )}
        >
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 md:px-6">
            <span className="font-semibold">
              {state.incident.status === "active"
                ? "Incident simulé en cours : suspicion de rançongiciel"
                : "Reprise en mode secours (simulation)"}
            </span>
            {pathname !== "/incidents" && (
              <Link to="/incidents" className="font-semibold underline underline-offset-4">
                Voir la procédure
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Navigation mobile */}
      <nav aria-label="Navigation principale" className="border-b bg-card md:hidden">
        <ul className="flex overflow-x-auto px-2">
          {NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={isActive(item.to) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm",
                  isActive(item.to)
                    ? "border-primary font-semibold text-accent-foreground"
                    : "border-transparent text-muted-foreground",
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
                {item.to === "/incidents" && state.incident.status === "active" && (
                  <span
                    className="size-2 rounded-full bg-destructive"
                    aria-label="incident actif"
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 md:px-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-6 flex flex-col rounded-xl border bg-card p-3 shadow-card">
            <nav aria-label="Navigation principale">
              <ul className="space-y-1">
                {NAV.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      aria-current={isActive(item.to) ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        isActive(item.to)
                          ? "bg-accent font-semibold text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <item.icon className="size-5" aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                      {item.to === "/incidents" && state.incident.status === "active" && (
                        <span
                          className="size-2.5 rounded-full bg-destructive"
                          aria-label="incident actif"
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-6 flex items-center gap-3 border-t px-3 pt-4">
              <UserRound className="size-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{COMMUNE.profile}</p>
                <p className="text-xs text-muted-foreground">Profil de démonstration</p>
              </div>
            </div>
          </div>
        </aside>
        <main id="contenu" className="min-w-0 flex-1">
          {children}
        </main>
      </div>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-muted-foreground md:px-6">
          <span>Prototype DEI · aucun système réel connecté · données fictives</span>
          <LimitsDialog
            trigger={
              <button
                type="button"
                className="font-semibold text-primary underline underline-offset-4"
              >
                Limites de la simulation
              </button>
            }
          />
        </div>
      </footer>
    </div>
  );
}
