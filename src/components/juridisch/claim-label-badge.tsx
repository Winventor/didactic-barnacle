import type { ClaimLabel } from "@/legal/types";
import { cn } from "@/lib/utils";

const LABELS: Record<ClaimLabel, { text: string; className: string }> = {
  BRON: { text: "BRON", className: "label-bron" },
  AFGELEIDE_RECHTSREGEL: { text: "AFGELEIDE RECHTSREGEL", className: "label-afgeleid" },
  TOEPASSING_OP_CASUS: { text: "TOEPASSING OP DE CASUS", className: "label-toepassing" },
};

export function ClaimLabelBadge({ label }: { label: ClaimLabel }) {
  const config = LABELS[label];
  return <span className={cn(config.className)}>{config.text}</span>;
}

export function LegalDisclaimer() {
  return (
    <div className="legal-warning">
      <strong>Juridische disclaimer:</strong> Dit platform biedt geen juridisch advies. Alle
      analyses en conceptdocumenten zijn indicatief en gebaseerd op ingevoerde feiten en
      opgehaalde openbare bronnen. Raadpleeg een advocaat voor definitief juridisch advies.
      Proceskansindicaties zijn geen garantie.
    </div>
  );
}
