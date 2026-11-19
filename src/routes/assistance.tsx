import { createFileRoute } from "@tanstack/react-router";
import {
  Bot,
  Compass,
  Headset,
  HelpCircle,
  Send,
  ShieldOff,
  Ticket as TicketIcon,
  TriangleAlert,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { nowLabel, useDemo } from "@/components/demo/DemoProvider";
import { Note, PageHeader, Panel, PitchNext, StatusBadge } from "@/components/demo/ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { assistantProvider, QUICK_QUESTIONS, type AssistantReply } from "@/lib/assistant";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type TicketCategory,
  type TicketPriority,
} from "@/lib/demo-data";
import type { Ticket } from "@/lib/demo-state";

export const Route = createFileRoute("/assistance")({
  head: () => ({
    meta: [
      { title: "Assistance — Municipal Cyber Kit (démo)" },
      {
        name: "description",
        content:
          "Assistant de premier niveau aux réponses simulées, relais vers un technicien et tickets fictifs pour les agents municipaux.",
      },
      { property: "og:title", content: "Assistance — Municipal Cyber Kit (démo)" },
      {
        property: "og:description",
        content: "Un premier niveau d'aide, puis un technicien si nécessaire (prototype).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistancePage,
});

interface TicketDraft {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
}

const EMPTY_DRAFT: TicketDraft = {
  subject: "",
  category: "Autre",
  priority: "Normale",
  description: "",
};

const ROLE_CARDS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Compass, title: "Oriente", text: "Premiers réflexes et fiches réflexes" },
  {
    icon: HelpCircle,
    title: "Aide à qualifier",
    text: "Une ou deux questions simples sur l'incident",
  },
  { icon: UserRound, title: "Passe la main", text: "Ticket et contact d'un technicien" },
];

function ReplyCard({
  reply,
  onTicket,
  onTechnician,
}: {
  reply: AssistantReply;
  onTicket: (priority?: TicketPriority) => void;
  onTechnician: () => void;
}) {
  return (
    <div className="space-y-3 text-sm">
      <p>{reply.text}</p>
      {reply.steps && (
        <ol className="list-decimal space-y-1 pl-5">
          {reply.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      )}
      {reply.questions && (
        <div>
          <p className="font-semibold">Pour mieux vous orienter :</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {reply.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      )}
      {reply.fiche && (
        <p className="text-muted-foreground">
          Fiche suggérée : <span className="font-semibold text-foreground">{reply.fiche}</span>
        </p>
      )}
      {reply.escalate ? (
        <div className="rounded-lg border-2 border-destructive/40 bg-destructive-soft p-3 text-destructive-strong">
          <p className="flex items-center gap-2 font-bold">
            <TriangleAlert className="size-4" aria-hidden="true" />
            Situation potentiellement sérieuse
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="destructive" size="sm" onClick={onTechnician}>
              <Headset aria-hidden="true" />
              Contacter un technicien
            </Button>
            <Button variant="outline" size="sm" onClick={() => onTicket("Prioritaire")}>
              Créer un ticket prioritaire
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => onTicket()}>
          <TicketIcon aria-hidden="true" />
          Créer un ticket
        </Button>
      )}
    </div>
  );
}

function TicketDialog({ draft, onClose }: { draft: TicketDraft | null; onClose: () => void }) {
  const { state, dispatch } = useDemo();
  const [form, setForm] = useState<TicketDraft>(EMPTY_DRAFT);
  const [created, setCreated] = useState<Ticket | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (draft) {
      setForm(draft);
      setCreated(null);
      setPendingId(null);
    }
  }, [draft]);

  useEffect(() => {
    if (pendingId) setCreated(state.tickets.find((t) => t.id === pendingId) ?? null);
  }, [pendingId, state.tickets]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim()) return;
    setPendingId(`MCK-${String(state.ticketSeq + 1).padStart(4, "0")}`);
    dispatch({
      type: "CREATE_TICKET",
      ticket: { ...form, subject: form.subject.trim(), description: form.description.trim() },
      at: nowLabel(),
    });
  };

  const field = "mt-1 block w-full rounded-md border border-input bg-card px-3 py-2 text-sm";

  return (
    <Dialog open={draft !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{created ? "Ticket créé (fictif)" : "Créer un ticket"}</DialogTitle>
          <DialogDescription>
            Démonstration : aucune demande n'est réellement envoyée.
          </DialogDescription>
        </DialogHeader>
        {created ? (
          <div className="space-y-4">
            <Note tone="success">
              <p className="font-bold">Ticket {created.id}</p>
              <p className="mt-1">
                {created.subject} · priorité {created.priority.toLowerCase()} · statut{" "}
                <strong>{created.status}</strong>
              </p>
            </Note>
            <DialogFooter>
              <Button onClick={onClose}>Fermer</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm">
              <span className="font-semibold">Objet</span>
              <input
                className={field}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                maxLength={120}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-semibold">Catégorie</span>
                <select
                  className={field}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as TicketCategory })}
                >
                  {TICKET_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-semibold">Priorité estimée</span>
                <select
                  className={field}
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as TicketPriority })}
                >
                  {TICKET_PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-semibold">Description (facultative)</span>
              <textarea
                className={field}
                rows={3}
                maxLength={500}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Ne saisissez aucune donnée personnelle, mot de passe ou document sensible.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={!form.subject.trim()}>
                Valider le ticket
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TechnicianDialog({
  open,
  onOpenChange,
  onTicket,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onTicket: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contacter un technicien</DialogTitle>
          <DialogDescription>
            Dans l'offre envisagée, un technicien d'astreinte prendrait le relais par téléphone.
            Dans cette démonstration, aucun appel ni message n'est envoyé.
          </DialogDescription>
        </DialogHeader>
        <Note tone="info" icon={<Headset />}>
          Astreinte technique (fictive) · réponse visée sous 1 heure pour un ticket prioritaire.
        </Note>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onOpenChange(false);
              onTicket();
            }}
          >
            Créer un ticket prioritaire
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssistancePage() {
  const { state, dispatch } = useDemo();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [ticketDraft, setTicketDraft] = useState<TicketDraft | null>(null);
  const [techOpen, setTechOpen] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.technicianRequested) {
      setTechOpen(true);
      dispatch({ type: "REQUEST_TECHNICIAN", value: false });
    }
  }, [state.technicianRequested, dispatch]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [state.chat.length]);

  const ask = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);
    dispatch({ type: "CHAT_ADD", message: { role: "user", text: question } });
    const reply = await assistantProvider.reply(question, {
      incidentActive: state.incident.status === "active",
    });
    dispatch({ type: "CHAT_ADD", message: { role: "assistant", text: reply.text, reply } });
    setBusy(false);
  };

  const openTicketFrom = (reply?: AssistantReply, priority?: TicketPriority) =>
    setTicketDraft(
      reply
        ? { ...EMPTY_DRAFT, ...reply.ticket, priority: priority ?? reply.ticket.priority }
        : { ...EMPTY_DRAFT, priority: priority ?? "Normale" },
    );

  const priorityDraft = (): TicketDraft => ({
    subject: "Demande d'intervention d'un technicien",
    category: "Incident de sécurité",
    priority: "Prioritaire",
    description: "",
  });

  return (
    <>
      <PageHeader
        title="Assistance IA et support"
        subtitle="Un premier niveau d'aide, puis un technicien si nécessaire"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section
          aria-labelledby="assistant-title"
          className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-card lg:col-span-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 bg-navy px-5 py-3 text-navy-foreground">
            <h2 id="assistant-title" className="flex items-center gap-2 font-bold">
              <Bot className="size-5" aria-hidden="true" />
              Assistant Municipal Cyber Kit
            </h2>
            <span className="rounded bg-navy-foreground px-2 py-0.5 text-xs font-bold text-navy">
              RÉPONSES SIMULÉES
            </span>
          </div>

          <div className="space-y-2 border-b px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Mode démonstration : les réponses sont pré-écrites, aucune intelligence artificielle
              n'est connectée.
            </p>
            <p className="text-xs font-semibold text-warning-strong">
              Ne saisissez aucune donnée personnelle, mot de passe ou document sensible.
            </p>
          </div>

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation avec l'assistant"
            className="max-h-[480px] min-h-[220px] flex-1 space-y-4 overflow-y-auto px-5 py-4"
          >
            {state.chat.length === 0 && (
              <div className="rounded-lg border bg-info-soft p-4 text-sm text-info-strong">
                Bonjour, je peux vous indiquer les premiers réflexes et vous orienter vers un
                technicien. Choisissez une question ci-dessous ou décrivez la situation.
              </div>
            )}
            {state.chat.map((m) =>
              m.role === "user" ? (
                <div
                  key={m.id}
                  className="ml-auto max-w-[85%] rounded-lg border bg-muted px-4 py-3 text-sm"
                >
                  <span className="sr-only">Vous : </span>
                  {m.text}
                </div>
              ) : (
                <div
                  key={m.id}
                  className="max-w-[92%] rounded-lg border border-primary/20 bg-info-soft px-4 py-3"
                >
                  <p className="mb-2 text-xs font-bold text-info-strong">
                    Assistant (réponse simulée)
                  </p>
                  {m.reply ? (
                    <ReplyCard
                      reply={m.reply}
                      onTicket={(p) => openTicketFrom(m.reply, p)}
                      onTechnician={() => setTechOpen(true)}
                    />
                  ) : (
                    <p className="text-sm">{m.text}</p>
                  )}
                </div>
              ),
            )}
          </div>

          <div className="border-t px-5 py-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Questions rapides</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void ask(q)}
                  disabled={busy}
                  className="rounded-full border bg-card px-3 py-1.5 text-sm hover:border-primary hover:bg-info-soft disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void ask(input);
              }}
            >
              <label htmlFor="question" className="sr-only">
                Votre question
              </label>
              <input
                id="question"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Décrire la situation… (données fictives)"
                maxLength={300}
                autoComplete="off"
                className="h-10 min-w-0 flex-1 rounded-md border border-input bg-card px-3 text-sm"
              />
              <Button type="submit" disabled={!input.trim() || busy}>
                <Send aria-hidden="true" />
                Envoyer
              </Button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={() => openTicketFrom()}>
                <TicketIcon aria-hidden="true" />
                Créer un ticket
              </Button>
              <Button variant="navy" onClick={() => setTechOpen(true)}>
                <Headset aria-hidden="true" />
                Contacter un technicien
              </Button>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <Panel title="Ce que fait l'assistant">
            <ul className="space-y-4">
              {ROLE_CARDS.map((c) => (
                <li key={c.title} className="flex gap-3">
                  <c.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-semibold">{c.title}</span>
                    <span className="block text-xs text-muted-foreground">{c.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Note tone="warning" icon={<ShieldOff />} className="mt-5">
              Pas d'accès aux serveurs ni aux postes. Aucune décision d'administration, aucune
              restauration ordonnée.
            </Note>
          </Panel>

          <Panel title="Mes tickets" description="Tickets fictifs de la session">
            {state.tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun ticket pour le moment.</p>
            ) : (
              <ul className="space-y-3">
                {state.tickets.map((t) => (
                  <li key={t.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold">{t.id}</span>
                      <StatusBadge tone="warning">{t.status}</StatusBadge>
                    </div>
                    <p className="mt-1">{t.subject}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.category} · {t.priority} · {t.createdAt}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <TicketDialog draft={ticketDraft} onClose={() => setTicketDraft(null)} />
      <TechnicianDialog
        open={techOpen}
        onOpenChange={setTechOpen}
        onTicket={() => setTicketDraft(priorityDraft())}
      />

      <PitchNext step={6} to="/" label="Retour au tableau de bord" />
    </>
  );
}
