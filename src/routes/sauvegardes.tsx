import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, CircleCheck, Circle, FlaskConical, Lock, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

import { nowLabel, useDemo } from "@/components/demo/DemoProvider";
import { Note, PageHeader, Panel, PitchNext, StatCard, StatusBadge } from "@/components/demo/ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BackupId } from "@/lib/demo-data";
import { getBackupStats, getBackupsView } from "@/lib/demo-state";

export const Route = createFileRoute("/sauvegardes")({
  head: () => ({
    meta: [
      { title: "Sauvegardes — Municipal Cyber Kit (démo)" },
      {
        name: "description",
        content:
          "Copies isolées fictives, historique des sauvegardes et test de restauration simulé pour une petite mairie.",
      },
      { property: "og:title", content: "Sauvegardes — Municipal Cyber Kit (démo)" },
      {
        property: "og:description",
        content: "Historique fictif des sauvegardes et test de restauration simulé.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BackupsPage,
});

const RUN_STEPS = [
  "Sélection de la copie isolée (fictive)",
  "Restauration dans un espace de test séparé (simulé)",
  "Contrôle d'ouverture des fichiers (simulé)",
  "Rédaction du compte rendu",
];

type BackupView = ReturnType<typeof getBackupsView>[number];

function BackupDetail({
  backup: selected,
  onClose,
}: {
  backup: BackupView | null;
  onClose: () => void;
}) {
  // Garde le contenu affiché pendant la fermeture de la fenêtre.
  const [backup, setBackup] = useState<BackupView | null>(selected);
  useEffect(() => {
    if (selected) setBackup(selected);
  }, [selected]);
  return (
    <Dialog open={selected !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {backup && (
          <>
            <DialogHeader>
              <DialogTitle>{backup.label}</DialogTitle>
              <DialogDescription>{backup.description} · données fictives</DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Dernière copie</dt>
              <dd className="font-semibold">{backup.lastCopy}</dd>
              <dt className="text-muted-foreground">Volume</dt>
              <dd className="font-semibold">{backup.size}</dd>
              <dt className="text-muted-foreground">Copie vérifiée</dt>
              <dd>
                {backup.verified ? (
                  <StatusBadge tone="success">Vérifiée</StatusBadge>
                ) : (
                  <StatusBadge tone="warning">Non contrôlée</StatusBadge>
                )}
              </dd>
              <dt className="text-muted-foreground">Restauration testée</dt>
              <dd>
                {backup.restoreTested ? (
                  <span className="font-semibold">{backup.restoreTested}</span>
                ) : (
                  <StatusBadge tone="warning">Jamais testée</StatusBadge>
                )}
              </dd>
              <dt className="text-muted-foreground">Emplacement envisagé</dt>
              <dd>Copie isolée hors mairie, chiffrée (principe non déployé)</dd>
            </dl>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Trois dernières copies</h3>
              <ul className="divide-y rounded-lg border text-sm">
                {backup.history.map((h) => (
                  <li key={h.when} className="flex justify-between px-3 py-2">
                    <span>{h.when}</span>
                    <span className="text-muted-foreground">{h.result}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Note tone="neutral">
              Une copie présente n'est pas une restauration testée : seul un test permet de
              confirmer que les données sont réutilisables.
            </Note>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RestoreTestDialog({
  open,
  onOpenChange,
  backups,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  backups: BackupView[];
}) {
  const { dispatch } = useDemo();
  const firstUntested = backups.find((b) => !b.simulatedTest && !b.verified)?.id ?? "comptabilite";
  const [target, setTarget] = useState<BackupId>(firstUntested);
  const [phase, setPhase] = useState<"confirm" | "running" | "done">("confirm");
  const [progress, setProgress] = useState(0);
  const [doneAt, setDoneAt] = useState("");

  useEffect(() => {
    if (open) {
      setPhase("confirm");
      setProgress(0);
      setTarget(firstUntested);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (phase !== "running") return;
    if (progress >= RUN_STEPS.length) {
      const at = nowLabel();
      setDoneAt(at);
      dispatch({ type: "RESTORE_TEST_DONE", backup: target, at });
      setPhase("done");
      return;
    }
    const t = window.setTimeout(() => setProgress((p) => p + 1), 650);
    return () => window.clearTimeout(t);
  }, [phase, progress, target, dispatch]);

  const label = backups.find((b) => b.id === target)?.label ?? "";

  return (
    <Dialog open={open} onOpenChange={(o) => phase !== "running" && onOpenChange(o)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {phase === "done" ? "Compte rendu du test" : "Simuler un test de restauration"}
          </DialogTitle>
          <DialogDescription>
            Simulation uniquement : aucune sauvegarde réelle n'est créée, contrôlée ni restaurée.
          </DialogDescription>
        </DialogHeader>

        {phase === "confirm" && (
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-semibold">Copie à tester</legend>
            {backups.map((b) => (
              <label
                key={b.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-info-soft"
              >
                <input
                  type="radio"
                  name="backup"
                  value={b.id}
                  checked={target === b.id}
                  onChange={() => setTarget(b.id)}
                  className="accent-primary"
                />
                <span className="flex-1 font-semibold">{b.label}</span>
                <span className="text-xs text-muted-foreground">{b.lastCopy}</span>
              </label>
            ))}
          </fieldset>
        )}

        {phase !== "confirm" && (
          <ol className="space-y-2 text-sm" aria-live="polite">
            {RUN_STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                {i < progress ? (
                  <CircleCheck className="size-4 text-success" aria-label="Terminé" />
                ) : (
                  <Circle className="size-4 text-muted-foreground" aria-label="En attente" />
                )}
                <span className={i < progress ? "" : "text-muted-foreground"}>{s}</span>
              </li>
            ))}
          </ol>
        )}

        {phase === "done" && (
          <Note tone="success" icon={<CircleCheck />}>
            <p className="font-bold">Test réussi (simulation)</p>
            <p className="mt-1">
              Copie « {label} » · {doneAt}. Durée estimée d'une vraie restauration : environ 15
              minutes (valeur fictive). Aucune donnée réelle n'a été manipulée.
            </p>
          </Note>
        )}

        <DialogFooter>
          {phase === "confirm" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={() => setPhase("running")}>
                <FlaskConical aria-hidden="true" />
                Lancer la simulation
              </Button>
            </>
          )}
          {phase === "running" && (
            <p className="text-sm text-muted-foreground">Simulation en cours…</p>
          )}
          {phase === "done" && <Button onClick={() => onOpenChange(false)}>Fermer</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BackupsPage() {
  const { state } = useDemo();
  const backups = getBackupsView(state);
  const stats = getBackupStats(state);
  const [detail, setDetail] = useState<BackupView | null>(null);
  const [testOpen, setTestOpen] = useState(false);
  const lastSimulated = Object.values(state.restoreTests).at(-1);

  return (
    <>
      <PageHeader
        title="Sauvegardes"
        subtitle="Copies isolées, historique des sauvegardes et vérifications"
      />

      {state.incident.status === "active" && (
        <Note tone="danger" icon={<ShieldAlert />} className="mb-6">
          Incident simulé : dans ce scénario, les copies isolées ne sont pas touchées. Leur
          intégrité se vérifie à l'étape 3 de la procédure, onglet Incidents.
        </Note>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Copies disponibles"
          value={String(stats.available)}
          hint="Dans cet exemple"
          tone="success"
        />
        <StatCard
          label="À vérifier"
          value={String(stats.toVerify.length)}
          hint={stats.toVerify.length ? stats.toVerify.map((b) => b.label).join(", ") : "Aucune"}
          tone={stats.toVerify.length ? "warning" : "success"}
        />
        <StatCard
          label="Dernier test de restauration"
          value={lastSimulated ? "Aujourd'hui" : "7 jours"}
          hint="Résultat fictif : réussi"
          tone="info"
        />
      </div>

      <Panel
        className="mt-6"
        title="Historique des sauvegardes"
        actions={
          <Button onClick={() => setTestOpen(true)}>
            <FlaskConical aria-hidden="true" />
            Simuler un test de restauration
          </Button>
        }
      >
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Liste fictive des sauvegardes de la commune</caption>
            <thead>
              <tr className="border-b bg-muted text-xs text-muted-foreground">
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  Élément
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  Dernière copie
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  Vérification de la copie
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  Restauration testée
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.id} className="border-b last:border-0">
                  <th scope="row" className="px-3 py-3.5 font-semibold">
                    {b.label}
                  </th>
                  <td className="px-3 py-3.5">{b.lastCopy}</td>
                  <td className="px-3 py-3.5">
                    {b.verified ? (
                      <StatusBadge tone="success">Vérifiée</StatusBadge>
                    ) : (
                      <StatusBadge tone="warning">Test nécessaire</StatusBadge>
                    )}
                  </td>
                  <td className="px-3 py-3.5">
                    {b.restoreTested ? (
                      <span className={b.simulatedTest ? "font-semibold text-success-strong" : ""}>
                        {b.restoreTested}
                      </span>
                    ) : (
                      <span className="text-warning-strong">Jamais testée</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5">
                    <button
                      type="button"
                      onClick={() => setDetail(b)}
                      className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      Voir le détail<span className="sr-only"> de {b.label}</span>
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note tone="info" icon={<Lock />} className="mt-4">
          Principe envisagé : copies chiffrées, séparées des systèmes locaux. Toute restauration
          demande une validation humaine.
        </Note>
      </Panel>

      <BackupDetail backup={detail} onClose={() => setDetail(null)} />
      <RestoreTestDialog open={testOpen} onOpenChange={setTestOpen} backups={backups} />

      <PitchNext step={2} to="/incidents" label="Simuler une cyberattaque" />
    </>
  );
}
