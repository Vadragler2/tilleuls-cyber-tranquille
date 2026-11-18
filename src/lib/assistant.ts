// Assistant de premier niveau.
// Pour cette démonstration, AUCUNE IA n'est connectée : les réponses sont pré-écrites.
// L'interface AssistantProvider permet de brancher plus tard un vrai fournisseur
// (appel côté serveur uniquement), sans changer l'écran.
import type { TicketCategory, TicketPriority } from "./demo-data";

export interface AssistantReply {
  text: string;
  steps?: string[];
  questions?: string[];
  fiche?: string;
  /** Situation sérieuse : afficher « Contacter un technicien » et proposer un ticket prioritaire. */
  escalate: boolean;
  ticket: { subject: string; category: TicketCategory; priority: TicketPriority };
}

export interface AssistantContext {
  incidentActive: boolean;
}

export interface AssistantProvider {
  id: string;
  /** true tant que les réponses sont scriptées : l'écran l'affiche clairement. */
  isSimulated: boolean;
  reply(input: string, ctx: AssistantContext): Promise<AssistantReply>;
}

export const QUICK_QUESTIONS = [
  "Une sauvegarde a échoué",
  "Le logiciel d'état civil ne fonctionne plus",
  "Je soupçonne un mail frauduleux",
  "Comment demander de l'aide ?",
] as const;

function normalize(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’`]/g, "'");
}

const SERIOUS =
  /ran[cs]on|ransomware|rancongiciel|pirat|compromi|fuite|vol de donnee|donnees personnelles (ont|sont)|j'ai clique|cliqu[ée] sur|ouvert la piece|(saisi|donne|communique|entre) (mon |le |un |mes )?(mot de passe|identifiant)|plusieurs postes|tous les postes|se propage|propagation|virus|fichiers? (chiffre|renomme|crypte)|ecran (rouge|bloque)|aggrav/;

export function simulatedReply(input: string, ctx: AssistantContext): AssistantReply {
  const q = normalize(input);
  const incidentNote = ctx.incidentActive
    ? " Un incident simulé est en cours : suivez aussi la procédure de l'onglet Incidents."
    : "";

  if (SERIOUS.test(q)) {
    return {
      text:
        "Ce que vous décrivez peut indiquer un incident sérieux, avec un risque pour les données ou d'aggravation. Je ne peux ni intervenir sur les postes ni décider d'une restauration : un technicien doit prendre le relais." +
        incidentNote,
      steps: [
        "Débranchez le poste du réseau (câble et wifi) sans l'éteindre.",
        "Ne payez rien et ne répondez à aucun message de rançon.",
        "Prévenez la secrétaire de mairie et contactez un technicien.",
        "Ne lancez aucune restauration sans vérification ni validation.",
      ],
      fiche: "Fiche réflexe n°1 — Suspicion de cyberattaque",
      escalate: true,
      ticket: {
        subject: "Suspicion d'incident de sécurité",
        category: "Incident de sécurité",
        priority: "Prioritaire",
      },
    };
  }

  if (/sauvegarde|copie de secours|backup/.test(q)) {
    return {
      text:
        "Un échec ponctuel de sauvegarde n'est pas forcément grave, mais il faut le traiter rapidement pour ne pas rester sans copie récente." +
        incidentNote,
      steps: [
        "Notez l'heure et le message d'erreur affiché.",
        "Ne supprimez pas les anciennes copies.",
        "Vérifiez dans l'onglet Sauvegardes la date de la dernière copie réussie.",
      ],
      questions: [
        "Est-ce la première fois que cette sauvegarde échoue ?",
        "Le message parle-t-il d'un manque d'espace ou d'un accès refusé ?",
      ],
      fiche: "Fiche réflexe n°3 — Échec de sauvegarde",
      escalate: false,
      ticket: { subject: "Échec d'une sauvegarde", category: "Sauvegarde", priority: "Normale" },
    };
  }

  if (/etat civil|logiciel|application|ne (fonctionne|marche) plus|inaccessible|plante/.test(q)) {
    return {
      text: "Je peux vous guider pour les premiers réflexes." + incidentNote,
      steps: [
        "N'utilisez plus le poste s'il présente un comportement suspect.",
        "Prévenez le référent informatique.",
        "Ne restaurez rien sans vérification.",
      ],
      questions: [
        "Le problème touche-t-il un seul poste ou plusieurs ?",
        "Voyez-vous un message inhabituel (demande de rançon, fichiers renommés) ?",
      ],
      fiche: "Fiche réflexe n°2 — Logiciel métier indisponible",
      escalate: false,
      ticket: {
        subject: "Logiciel métier indisponible",
        category: "Logiciel métier",
        priority: "Haute",
      },
    };
  }

  if (/mail|courriel|message|hameconnage|phishing|frauduleu|piece jointe|lien/.test(q)) {
    return {
      text: "Bon réflexe de vous méfier. Tant que rien n'a été ouvert, le risque reste limité." + incidentNote,
      steps: [
        "N'ouvrez pas la pièce jointe et ne cliquez sur aucun lien.",
        "Ne répondez pas à l'expéditeur.",
        "Transférez-le au référent informatique, puis supprimez-le.",
      ],
      questions: [
        "Avez-vous cliqué sur un lien ou ouvert une pièce jointe ?",
        "Avez-vous saisi un identifiant ou un mot de passe ?",
      ],
      fiche: "Fiche réflexe n°4 — Courriel suspect",
      escalate: false,
      ticket: {
        subject: "Courriel suspect reçu",
        category: "Messagerie / courriel suspect",
        priority: "Normale",
      },
    };
  }

  if (/aide|technicien|contact|ticket|support|appeler/.test(q)) {
    return {
      text:
        "Deux possibilités : créer un ticket pour une demande non urgente, ou contacter un technicien si la situation est sérieuse (données en danger, plusieurs postes touchés)." +
        incidentNote,
      steps: [
        "Décrivez le problème en une phrase, sans donnée personnelle.",
        "Indiquez le service concerné et depuis quand.",
        "Choisissez une priorité : un technicien la confirmera.",
      ],
      escalate: false,
      ticket: { subject: "Demande d'assistance", category: "Autre", priority: "Normale" },
    };
  }

  return {
    text:
      "Je n'ai pas bien identifié la situation. Quelques précisions m'aideront à vous orienter." +
      incidentNote,
    questions: [
      "Quel service ou quel logiciel est concerné ?",
      "Depuis quand le problème se produit-il ?",
    ],
    escalate: false,
    ticket: { subject: "Demande d'assistance", category: "Autre", priority: "Normale" },
  };
}

export const simulatedProvider: AssistantProvider = {
  id: "simulated",
  isSimulated: true,
  reply: async (input, ctx) => simulatedReply(input, ctx),
};

/** Fournisseur utilisé par l'écran. Remplacer ici lors d'une intégration future. */
export const assistantProvider: AssistantProvider = simulatedProvider;
