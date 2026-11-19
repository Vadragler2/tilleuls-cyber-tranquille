import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  BookOpenCheck,
  CheckCircle2,
  Download,
  Phone,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { EMERGENCY_KIT_STORAGE_KEY } from "@/lib/demo-storage";

type Role = "referent" | "prestataire" | "direction";
type Contact = { nom: string; telephone: string };
type Memo = {
  contacts: Record<Role, Contact>;
  relecture: string | null;
  exercice: { date: string; score: number } | null;
};
const ROLES: { id: Role; titre: string }[] = [
  { id: "referent", titre: "Référent de la mairie" },
  { id: "prestataire", titre: "Prestataire informatique" },
  { id: "direction", titre: "Responsable de la reprise" },
];
const INITIAL: Memo = {
  contacts: {
    referent: { nom: "", telephone: "" },
    prestataire: { nom: "", telephone: "" },
    direction: { nom: "", telephone: "" },
  },
  relecture: null,
  exercice: null,
};
const QUESTIONS = [
  {
    question: "Les fichiers municipaux deviennent illisibles. Premier réflexe ?",
    reponses: ["Isoler le poste du réseau et alerter.", "Restaurer immédiatement les fichiers."],
    juste: 0,
  },
  {
    question: "Une copie de sauvegarde existe. Peut-on redémarrer directement ?",
    reponses: ["Oui, une copie suffit.", "Non : vérifier la copie, puis obtenir l'autorisation."],
    juste: 1,
  },
] as const;

function dateFr(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "inconnue" : date.toLocaleDateString("fr-FR");
}

/** Démonstration locale : aucun contact ni résultat n'est transmis à un serveur. */
export function EmergencyKit() {
  const [memo, setMemo] = useState<Memo>(INITIAL);
  const [charge, setCharge] = useState(false);
  const [crise, setCrise] = useState(false);
  const [edition, setEdition] = useState(false);
  const [question, setQuestion] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const questionEnCours = question === null ? undefined : QUESTIONS[question];

  useEffect(() => {
    try {
      const stock = window.localStorage.getItem(EMERGENCY_KIT_STORAGE_KEY);
      if (stock) {
        const ancien = JSON.parse(stock) as Partial<Memo>;
        setMemo({
          ...INITIAL,
          ...ancien,
          contacts: { ...INITIAL.contacts, ...ancien.contacts },
        });
      }
    } catch {
      // La démonstration fonctionne aussi sans stockage.
    }
    setCharge(true);
  }, []);

  useEffect(() => {
    if (!charge) return;
    try {
      window.localStorage.setItem(EMERGENCY_KIT_STORAGE_KEY, JSON.stringify(memo));
    } catch {
      // Si le stockage est refusé, les données restent seulement dans la page.
    }
  }, [memo, charge]);

  const relectureDue =
    !memo.relecture ||
    !Number.isFinite(new Date(memo.relecture).getTime()) ||
    Date.now() - new Date(memo.relecture).getTime() > 90 * 86400000;

  function modifier(role: Role, champ: keyof Contact, valeur: string) {
    setMemo((actuel) => ({
      ...actuel,
      contacts: {
        ...actuel.contacts,
        [role]: { ...actuel.contacts[role], [champ]: valeur.slice(0, 80) },
      },
    }));
  }

  function repondre(choix: number) {
    if (question === null || !questionEnCours) return;
    const nouveauxPoints = score + Number(choix === questionEnCours.juste);
    setScore(nouveauxPoints);
    if (question === QUESTIONS.length - 1) {
      setMemo((actuel) => ({
        ...actuel,
        exercice: { date: new Date().toISOString(), score: nouveauxPoints },
      }));
      setQuestion(QUESTIONS.length);
    } else {
      setQuestion(question + 1);
    }
  }

  function exporter() {
    if (!memo.exercice) return;
    const lignes = [
      "Municipal Cyber Kit - compte rendu de demonstration",
      "Commune : Mairie des Tilleuls (fictive)",
      "Date : " + dateFr(memo.exercice.date),
      "Score : " + memo.exercice.score + " / " + QUESTIONS.length,
      "Scenario : fichiers devenus illisibles.",
      "Actions attendues : isoler, alerter, verifier les sauvegardes, valider la reprise.",
      "Exercice fictif : aucun systeme n'a ete teste.",
    ];
    const url = URL.createObjectURL(
      new Blob([lignes.join("\r\n")], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "MCK_Exercice_DEMO.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  return (
    <section className="mb-6 space-y-4" aria-labelledby="kit-urgence-titre">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-5 shadow-card">
        <ShieldAlert className="size-9 shrink-0 text-destructive" aria-hidden="true" />
        <div className="min-w-0 flex-1 basis-40">
          <h2 id="kit-urgence-titre" className="text-xl font-bold">
            Kit d'urgence de la mairie
          </h2>
          <p className="text-sm text-muted-foreground">
            Un plan clair, les contacts et un entraînement simple.
          </p>
        </div>
        <Button variant={crise ? "outline" : "destructive"} onClick={() => setCrise(!crise)}>
          <AlertTriangle className="size-4" aria-hidden="true" />
          {crise ? "Fermer le mode crise" : "Ouvrir le mode crise"}
        </Button>
      </div>

      {crise && (
        <div
          className="rounded-xl border-2 border-destructive/40 bg-destructive-soft p-5"
          role="region"
          aria-label="Premières actions d'urgence"
        >
          <h3 className="font-bold text-destructive-strong">
            Suspicion de cyberattaque : les 3 premiers réflexes
          </h3>
          <ol className="mt-3 grid gap-3 md:grid-cols-3">
            <li className="rounded-lg border bg-card p-3 text-sm">
              <strong className="block">1 · Prévenir</strong>Contacter le référent et le
              prestataire.
            </li>
            <li className="rounded-lg border bg-card p-3 text-sm">
              <strong className="block">2 · Isoler</strong>Déconnecter le poste suspect du réseau
              sans l'éteindre.
            </li>
            <li className="rounded-lg border bg-card p-3 text-sm">
              <strong className="block">3 · Documenter</strong>Noter les faits. Ne pas restaurer
              sans vérification ni accord.
            </li>
          </ol>
          <p className="mt-3 text-xs text-destructive-strong">
            Simulation pédagogique : suivre les procédures de la collectivité et les consignes du
            prestataire en situation réelle.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 font-bold">
              <Phone className="size-5 text-primary" aria-hidden="true" /> Contacts d'urgence
            </h3>
            <Button variant="outline" size="sm" onClick={() => setEdition(!edition)}>
              {edition ? "Terminer" : "Compléter"}
            </Button>
          </div>
          <ul className="mt-3 space-y-2">
            {ROLES.map(({ id, titre }) => (
              <li key={id} className="rounded-lg border p-3 text-sm">
                <p className="font-semibold">{titre}</p>
                {edition ? (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <label>
                      <span className="block text-xs">Nom fictif</span>
                      <input
                        aria-label={"Nom " + titre}
                        className="mt-1 h-10 w-full rounded-md border border-input bg-card px-2"
                        placeholder="À compléter"
                        value={memo.contacts[id].nom}
                        onChange={(e) => modifier(id, "nom", e.target.value)}
                      />
                    </label>
                    <label>
                      <span className="block text-xs">Téléphone fictif</span>
                      <input
                        aria-label={"Téléphone " + titre}
                        className="mt-1 h-10 w-full rounded-md border border-input bg-card px-2"
                        placeholder="À compléter"
                        value={memo.contacts[id].telephone}
                        onChange={(e) => modifier(id, "telephone", e.target.value)}
                      />
                    </label>
                  </div>
                ) : (
                  <p className="mt-1 text-muted-foreground">
                    {memo.contacts[id].nom || "À compléter"}
                    {memo.contacts[id].telephone ? " · " + memo.contacts[id].telephone : ""}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Ne saisissez pas de vraies coordonnées dans cette démo publique. Enregistrement local
            uniquement.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="flex items-center gap-2 font-bold">
              <BellRing className="size-5 text-primary" aria-hidden="true" /> Rappel de préparation
            </h3>
            <p className="mt-2 text-sm">
              {relectureDue
                ? "Plan à revoir : aucune vérification récente enregistrée."
                : "Plan relu le " + dateFr(memo.relecture!) + " (déclaration fictive)."}
            </p>
            <Button
              className="mt-3"
              variant="outline"
              size="sm"
              onClick={() =>
                setMemo((ancien) => ({ ...ancien, relecture: new Date().toISOString() }))
              }
            >
              <CheckCircle2 className="size-4" aria-hidden="true" /> Marquer comme vérifié
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Rappel visuel après 90 jours. Aucun courriel automatique n'est envoyé par ce
              prototype.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="flex items-center gap-2 font-bold">
              <BookOpenCheck className="size-5 text-primary" aria-hidden="true" /> Mini-exercice de
              crise
            </h3>
            {question === null && (
              <>
                <p className="mt-2 text-sm">
                  Deux décisions rapides et un compte rendu téléchargeable.
                </p>
                <Button
                  className="mt-3"
                  onClick={() => {
                    setScore(0);
                    setQuestion(0);
                  }}
                >
                  Commencer l'exercice
                </Button>
              </>
            )}
            {question !== null && questionEnCours && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Question {question + 1} / {QUESTIONS.length}
                </p>
                <p className="text-sm font-semibold">{questionEnCours.question}</p>
                {questionEnCours.reponses.map((reponse, index) => (
                  <Button
                    key={reponse}
                    className="h-auto w-full justify-start whitespace-normal py-3 text-left"
                    variant="outline"
                    onClick={() => repondre(index)}
                  >
                    {reponse}
                  </Button>
                ))}
              </div>
            )}
            {question === QUESTIONS.length && (
              <div className="mt-3 space-y-2">
                <p className="font-semibold text-success-strong">
                  Exercice terminé : {score} / {QUESTIONS.length}
                </p>
                <p className="text-sm">Isoler, alerter et valider avant toute reprise.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setScore(0);
                    setQuestion(0);
                  }}
                >
                  Recommencer
                </Button>
              </div>
            )}
            {memo.exercice && (
              <div className="mt-3 border-t pt-3">
                <p className="text-xs text-muted-foreground">
                  Dernier exercice fictif : {dateFr(memo.exercice.date)} · {memo.exercice.score}/
                  {QUESTIONS.length}
                </p>
                <Button className="mt-2" variant="outline" size="sm" onClick={exporter}>
                  <Download className="size-4" aria-hidden="true" /> Télécharger le bilan (.txt)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Prototype éducatif : aucune sauvegarde, intervention technique ou synchronisation entre
        appareils. Une version réelle nécessiterait une authentification et un hébergement
        indépendants et sécurisés.
      </p>
    </section>
  );
}
