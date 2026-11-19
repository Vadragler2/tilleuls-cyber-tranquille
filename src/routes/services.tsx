import { createFileRoute } from "@tanstack/react-router";
import { CircleCheck, CircleAlert, FileText, ListOrdered, MonitorCheck } from "lucide-react";
import { useState } from "react";

import { nowLabel, useDemo } from "@/components/demo/DemoProvider";
import { Note, PageHeader, PitchNext, StatusBadge, type Tone } from "@/components/demo/ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Priority, ServiceId } from "@/lib/demo-data";
import { getServicesView, type ServiceRuntime } from "@/lib/demo-state";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services municipaux — Municipal Cyber Kit (démo)" },
      {
        name: "description",
        content:
          "Priorités de reprise fictives des services de la mairie : état civil, fichiers municipaux, comptabilité.",
      },
      { property: "og:title", content: "Services municipaux — Municipal Cyber Kit (démo)" },
      {
        property: "og:description",
        content: "Choisir l'ordre de reprise des outils municipaux (prototype).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

const RUNTIME: Record<ServiceRuntime, { tone: Tone; label: string }> = {
  pret: { tone: "success", label: "Secours préparé" },
  "a-etudier": { tone: "warning", label: "À étudier" },
  indisponible: { tone: "danger", label: "Indisponible (incident simulé)" },
  secours: { tone: "success", label: "Mode secours (simulation)" },
  "hors-secours": { tone: "warning", label: "Hors secours — compatibilité à vérifier" },
  "non-active": { tone: "warning", label: "Hors secours — non activé lors de la reprise" },
};

function BackupAccessDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { state, dispatch } = useDemo();
  const services = getServicesView(state);
  const [done, setDone] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setDone(false);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tester l'accès de secours (simulation)</DialogTitle>
          <DialogDescription>
            Dans la solution envisagée, ce test vérifierait qu'un agent peut ouvrir chaque service
            depuis l'environnement de secours. Ici, rien n'est contacté : le résultat est fictif.
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <ul className="space-y-3 text-sm" aria-live="polite">
            {services.map((s) => (
              <li key={s.id} className="flex items-start gap-3 rounded-lg border p-3">
                {s.backupReady ? (
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <CircleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
                )}
                <span>
                  <span className="block font-semibold">{s.label}</span>
                  <span className="block text-muted-foreground">
                    {s.backupReady
                      ? "Accès de secours simulé : ouverture réussie."
                      : "Non testable : compatibilité du logiciel à confirmer avec l'éditeur."}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Note tone="warning">
            Le test ne se connecte à aucun logiciel métier et ne modifie aucun système.
          </Note>
        )}
        <DialogFooter>
          {done ? (
            <Button onClick={() => onOpenChange(false)}>Fermer</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => {
                  dispatch({ type: "BACKUP_ACCESS_TEST_DONE", at: nowLabel() });
                  setDone(true);
                }}
              >
                Lancer le test fictif
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ServicesPage() {
  const { state, dispatch } = useDemo();
  const services = getServicesView(state);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(state.priorities);
  const [accessOpen, setAccessOpen] = useState(false);

  const startEdit = () => {
    setDraft(state.priorities);
    setEditing(true);
  };

  return (
    <>
      <PageHeader
        title="Services essentiels"
        subtitle="Choisir l'ordre de reprise des outils municipaux"
      />

      <Note tone="info" className="mb-6">
        Une priorité élevée ne garantit pas un basculement instantané : la capacité de reprise de
        chaque logiciel métier dépend de sa compatibilité, et l'accès doit être testé.
      </Note>

      <ul className="space-y-4">
        {services.map((s) => {
          const rt = RUNTIME[s.runtime];
          return (
            <li key={s.id} className="rounded-xl border bg-card p-4 shadow-card md:p-5">
              <div className="flex flex-wrap items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-info-soft text-info-strong">
                  <FileText className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold">{s.label}</h2>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{s.compatibility}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {editing ? (
                    <label className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">Priorité</span>
                      <select
                        value={draft[s.id]}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            [s.id as ServiceId]: Number(e.target.value) as Priority,
                          })
                        }
                        className="h-10 rounded-md border border-input bg-card px-2"
                      >
                        <option value={1}>1 — reprise immédiate</option>
                        <option value={2}>2 — dans la journée</option>
                        <option value={3}>3 — peut attendre</option>
                      </select>
                    </label>
                  ) : (
                    <StatusBadge tone="info">Priorité {s.priority}</StatusBadge>
                  )}
                  <StatusBadge tone={rt.tone}>{rt.label}</StatusBadge>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {state.backupAccessTestAt && (
        <p className="mt-4 text-sm text-muted-foreground">
          Dernier test d'accès de secours : {state.backupAccessTestAt} (simulation).
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {editing ? (
          <>
            <Button
              onClick={() => {
                dispatch({ type: "SET_PRIORITIES", priorities: draft });
                setEditing(false);
              }}
            >
              Enregistrer les priorités
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Annuler
            </Button>
            <p className="w-full text-xs text-muted-foreground">
              {state.incident.status === "secours"
                ? "Les nouvelles priorités seront utilisées lors de la prochaine activation."
                : "Modification enregistrée dans ce prototype uniquement."}
            </p>
          </>
        ) : (
          <>
            <Button onClick={startEdit}>
              <ListOrdered aria-hidden="true" />
              Modifier les priorités
            </Button>
            <Button variant="navy" onClick={() => setAccessOpen(true)}>
              <MonitorCheck aria-hidden="true" />
              Tester l'accès de secours (simulation)
            </Button>
          </>
        )}
      </div>

      <BackupAccessDialog open={accessOpen} onOpenChange={setAccessOpen} />

      <PitchNext step={2} to="/incidents" label="Simuler une cyberattaque" />
    </>
  );
}
