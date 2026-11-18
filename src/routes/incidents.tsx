import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CircleCheck,
  Headset,
  Lock,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

import { nowLabel, useDemo } from "@/components/demo/DemoProvider";
import { Note, PageHeader, Panel, PitchNext, StatusBadge } from "@/components/demo/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { INCIDENT_STEPS, VALIDATOR_ROLES, type StepId } from "@/lib/demo-data";
import { getServicesView, getStepBlocker } from "@/lib/demo-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/incidents")({
  head: () => ({
    meta: [
      { title: "Incidents — Municipal Cyber Kit (démo)" },
      {
        name: "description",
        content:
          "Simulation d'une cyberattaque sur une petite mairie et procédure de reprise en 5 étapes, avec validation humaine.",
      },
      { property: "og:title", content: "Incidents — Municipal Cyber Kit (démo)" },
      {
        property: "og:description",
        content: "Simuler une suspicion de rançongiciel et suivre la procédure de reprise.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IncidentsPage,
});

const STEP_RESULT: Partial<Record<StepId, string>> = {
  signaler: "Incident signalé à la secrétaire de mairie et au référent (simulation).",
  isoler: "Poste administratif marqué comme isolé du réseau (simulation).",
  verifier:
    "Copie « Fichiers municipaux » d'aujourd'hui 01:30, antérieure à l'incident : intégrité confirmée (simulation).",
};

const STEP_ACTION: Partial<Record<StepId, string>> = {
  signaler: "Marquer comme signalé",
  isoler: "Marquer comme isolé",
  verifier: "Lancer la vérification fictive",
};

function StartIncident() {
  const { state, dispatch } = useDemo();
  return (
    <Panel>
      <div className="flex flex-col items-center py-8 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-success-soft text-success-strong">
          <ShieldCheck className="size-7" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-bold">Aucun incident actif</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Vous pouvez simuler une cyberattaque pour découvrir la procédure de reprise. Aucune action
          technique réelle n'est exécutée.
        </p>
        {state.incident.lastClosedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            Dernière simulation clôturée : {state.incident.lastClosedAt}
          </p>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="lg" className="mt-6">
              <ShieldAlert aria-hidden="true" />
              Simuler une cyberattaque
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Démarrer la simulation ?</AlertDialogTitle>
              <AlertDialogDescription>
                Le scénario fictif simule une suspicion de rançongiciel sur un poste administratif.
                L'état de l'application change, mais aucun système réel n'est touché et aucune
                commande n'est envoyée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={() => dispatch({ type: "START_INCIDENT", at: nowLabel() })}>
                Démarrer la simulation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Panel>
  );
}

function ValidateForm() {
  const { dispatch } = useDemo();
  const [role, setRole] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  return (
    <form
      className="mt-3 space-y-3 rounded-lg border bg-muted p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (role && confirmed) dispatch({ type: "COMPLETE_STEP", step: "valider", validatedBy: role });
      }}
    >
      <label className="block text-sm">
        <span className="font-semibold">Personne qui valide la reprise</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 block h-10 w-full rounded-md border border-input bg-card px-2 sm:max-w-xs"
          required
        >
          <option value="">Choisir un rôle…</option>
          {VALIDATOR_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1 size-4 accent-primary"
        />
        <span>Je confirme que cette personne a examiné la situation et autorise la reprise.</span>
      </label>
      <Button type="submit" disabled={!role || !confirmed}>
        Enregistrer la validation
      </Button>
    </form>
  );
}

function Procedure() {
  const { state, dispatch } = useDemo();
  const done = state.incident.steps;
  const current = INCIDENT_STEPS.find((s) => !done.includes(s.id))?.id;

  return (
    <Panel title="Parcours de reprise proposé" description="Chaque étape se marque comme accomplie dans la démonstration">
      <ol className="space-y-3">
        {INCIDENT_STEPS.map((step, i) => {
          const isDone = done.includes(step.id);
          const isCurrent = step.id === current && state.incident.status === "active";
          const blocker = getStepBlocker(state, step.id);
          return (
            <li
              key={step.id}
              className={cn(
                "rounded-lg border p-4",
                isCurrent && "border-primary bg-info-soft",
                isDone && "bg-success-soft/50",
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border-2 text-sm font-bold",
                    isDone
                      ? "border-success bg-success text-success-foreground"
                      : isCurrent
                        ? "border-primary bg-card text-primary"
                        : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {isDone ? <CircleCheck className="size-4" aria-label="Accomplie" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{step.title}</h3>
                    {isDone && <StatusBadge tone="success">Accomplie</StatusBadge>}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>

                  {isDone && STEP_RESULT[step.id] && (
                    <p className="mt-2 text-sm text-success-strong">{STEP_RESULT[step.id]}</p>
                  )}
                  {isDone && step.id === "valider" && (
                    <p className="mt-2 text-sm text-success-strong">
                      Reprise validée par : {state.incident.validatedBy} (simulation).
                    </p>
                  )}

                  {isCurrent && STEP_ACTION[step.id] && (
                    <Button
                      className="mt-3"
                      onClick={() => dispatch({ type: "COMPLETE_STEP", step: step.id })}
                    >
                      {STEP_ACTION[step.id]}
                    </Button>
                  )}
                  {isCurrent && step.id === "valider" && <ValidateForm />}
                  {step.id === "activer" && !isDone && state.incident.status === "active" && (
                    <div className="mt-3 space-y-2">
                      <Button
                        variant="success"
                        disabled={blocker !== null}
                        onClick={() => dispatch({ type: "COMPLETE_STEP", step: "activer" })}
                      >
                        Activer les services prioritaires de secours (simulation)
                      </Button>
                      {blocker && (
                        <p className="flex items-center gap-1.5 text-xs text-warning-strong">
                          <Lock className="size-3.5" aria-hidden="true" />
                          {blocker}
                        </p>
                      )}
                    </div>
                  )}
                  {!isDone && !isCurrent && step.id !== "activer" && (
                    <p className="mt-2 text-xs text-muted-foreground">En attente de l'étape précédente.</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <Note tone="warning" className="mt-4">
        Vérifier que la sauvegarde est saine avant toute activation. Aucune reprise automatique.
      </Note>
    </Panel>
  );
}

function SecoursResult() {
  const { state, dispatch } = useDemo();
  const services = getServicesView(state);
  return (
    <Panel>
      <Note tone="success" icon={<ShieldCheck />}>
        <p className="text-base font-bold">
          Services essentiels disponibles en mode secours (simulation)
        </p>
        <p className="mt-1">
          Reprise validée par {state.incident.validatedBy}. Les services de priorité 1 sont
          accessibles depuis l'environnement de secours fictif.
        </p>
      </Note>
      <ul className="mt-4 divide-y rounded-lg border text-sm">
        {services.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <span>
              <span className="font-semibold">{s.label}</span>{" "}
              <span className="text-muted-foreground">· priorité {s.priority}</span>
            </span>
            {s.runtime === "secours" ? (
              <StatusBadge tone="success">Disponible en secours</StatusBadge>
            ) : (
              <StatusBadge tone="warning">Hors secours — compatibilité à vérifier</StatusBadge>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={() => dispatch({ type: "CLOSE_INCIDENT", at: nowLabel() })}>
          <CircleCheck aria-hidden="true" />
          Clôturer l'incident simulé
        </Button>
        <Button variant="outline" onClick={() => dispatch({ type: "RESET" })}>
          <RotateCcw aria-hidden="true" />
          Réinitialiser la démonstration
        </Button>
      </div>
    </Panel>
  );
}

function IncidentsPage() {
  const { state, dispatch } = useDemo();
  const navigate = useNavigate();
  const status = state.incident.status;

  const askTechnician = () => {
    dispatch({ type: "REQUEST_TECHNICIAN", value: true });
    void navigate({ to: "/assistance" });
  };

  return (
    <>
      <PageHeader
        title="Gestion d'un incident"
        subtitle={
          status === "none"
            ? "Simulation de crise et procédure de reprise"
            : "Scénario : suspicion de rançongiciel sur un poste administratif"
        }
        aside={status !== "none" ? <StatusBadge tone="danger">Incident simulé</StatusBadge> : undefined}
      />

      {status === "none" && <StartIncident />}

      {status !== "none" && (
        <div className="space-y-6">
          {status === "active" && (
            <div
              role="alert"
              className="flex gap-3 rounded-xl border-2 border-destructive/40 bg-destructive-soft p-4 text-destructive-strong md:p-5"
            >
              <TriangleAlert className="mt-0.5 size-6 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-lg font-bold">Alerte fictive : des fichiers sont devenus inaccessibles</p>
                <p className="mt-1 text-sm">
                  Fichiers municipaux renommés et illisibles sur un poste administratif. Démarré :{" "}
                  {state.incident.startedAt}. Aucune action technique réelle n'est exécutée dans
                  cette maquette.
                </p>
              </div>
            </div>
          )}

          {status === "secours" && <SecoursResult />}
          <Procedure />

          <div className="flex flex-wrap gap-3">
            <Button variant="navy" onClick={askTechnician}>
              <Headset aria-hidden="true" />
              Demander de l'aide à un technicien
            </Button>
          </div>
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Aucun bouton de cet écran n'envoie de commande réelle ni ne modifie un système extérieur.
      </p>

      {status === "secours" ? (
        <PitchNext step={6} to="/assistance" label="Assistance IA et ticket" />
      ) : status === "none" ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card/60 px-4 py-3 text-sm text-muted-foreground">
          Parcours de démonstration · étape 3 sur 6 : cliquez sur « Simuler une cyberattaque ».
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed bg-card/60 px-4 py-3 text-sm text-muted-foreground">
          Parcours de démonstration · étapes 4 et 5 : terminez la procédure ci-dessus, puis
          rendez-vous dans{" "}
          <Link to="/assistance" className="font-semibold text-primary underline">
            l'Assistance IA
          </Link>
          .
        </div>
      )}
    </>
  );
}
