import type { ReactElement } from "react";

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

import { useDemo } from "./DemoProvider";

export function ResetDemoDialog({ trigger }: { trigger: ReactElement }) {
  const { resetDemo } = useDemo();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Réinitialiser la démonstration ?</AlertDialogTitle>
          <AlertDialogDescription>
            L'incident simulé, les priorités, les tests, les tickets, la conversation et les données
            du kit d'urgence (contacts, relecture et exercice) seront effacés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={resetDemo}>Réinitialiser</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
