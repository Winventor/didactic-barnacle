"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  BURNOUT_DEMOGRAPHIC_QUESTIONS,
  BURNOUT_PRIVACY_POLICY_URL,
  BURNOUT_RESEARCH_INTRO,
  BURNOUT_SYMPTOM_CATEGORIES,
  BURNOUT_TEST_INSTRUCTIONS,
  countSelectedSymptoms,
  getResultForSymptomCount,
  isValidEmail,
  type BurnoutResult,
} from "@/lib/walda/burnout-test";
import { parseWikiText } from "@/components/walda/wiki-text";
import { cn } from "@/lib/utils";

const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

function parseRichText(text: string) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(MARKDOWN_LINK_PATTERN);
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...parseWikiText(text.slice(lastIndex, match.index)));
    }

    parts.push(
      <a
        key={`link-${match.index}`}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
      >
        {match[1]}
      </a>,
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(...parseWikiText(text.slice(lastIndex)));
  }

  return parts.length > 0 ? parts : parseWikiText(text);
}

function SymptomCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
        checked
          ? "border-primary bg-primary/5"
          : "border-border/60 hover:border-primary/30 hover:bg-accent/50",
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <span className="leading-relaxed">{parseWikiText(label)}</span>
    </label>
  );
}

function ResultPanel({
  result,
  symptomCount,
  firstName,
}: {
  result: BurnoutResult;
  symptomCount: number;
  firstName: string;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <p className="text-sm font-medium text-primary mb-1">Uitslag burnout test</p>
        <p className="text-2xl font-semibold tracking-tight capitalize">
          {result.title}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {firstName ? `${firstName}, je` : "Je"} hebt{" "}
          <span className="font-medium text-foreground">{symptomCount}</span>{" "}
          {symptomCount === 1 ? "klacht aangevinkt" : "klachten aangevinkt"}.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Jouw uitslag: {result.title}
        </h3>
        {result.body.map((paragraph) => (
          <p
            key={paragraph}
            className="text-sm leading-relaxed text-muted-foreground"
          >
            {parseRichText(paragraph)}
          </p>
        ))}
      </div>

      {result.stressExplanation && (
        <div className="rounded-xl border border-border/60 bg-muted/30 p-5 space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Hoe werkt het met stress
          </h4>
          {result.stressExplanation.map((paragraph) => (
            <p
              key={paragraph}
              className="text-sm leading-relaxed text-muted-foreground"
            >
              {parseRichText(paragraph)}
            </p>
          ))}
        </div>
      )}

      {result.showEmailNote && (
        <p className="text-sm text-muted-foreground italic">
          PS: je ontvangt jouw uitslag én tips om met de situatie om te gaan ook
          per mail (check eventueel jouw spambox).
        </p>
      )}

      <div className="text-sm text-muted-foreground">
        <p>Hartelijke groeten,</p>
        <p className="font-semibold text-foreground mt-2">
          {result.signature.name}
        </p>
        {result.signature.titles && (
          <p className="mt-1">{parseWikiText(result.signature.titles)}</p>
        )}
        {result.signature.link && (
          <p className="mt-1">
            <a
              href={result.signature.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
            >
              {result.signature.link.label}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export function BurnoutTestClient() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(
    new Set(),
  );
  const [demographics, setDemographics] = useState<Record<string, string>>({});
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const symptomCount = useMemo(
    () => countSelectedSymptoms(selectedSymptoms),
    [selectedSymptoms],
  );
  const result = useMemo(
    () => getResultForSymptomCount(symptomCount),
    [symptomCount],
  );

  const demographicsComplete = BURNOUT_DEMOGRAPHIC_QUESTIONS.every(
    (question) => demographics[question.id],
  );

  const contactComplete =
    firstName.trim().length > 0 &&
    isValidEmail(email) &&
    privacyAccepted;

  function toggleSymptom(id: string, checked: boolean) {
    setSelectedSymptoms((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
    setShowResults(false);
  }

  function handleDemographicChange(questionId: string, optionId: string) {
    setDemographics((current) => ({ ...current, [questionId]: optionId }));
    setShowResults(false);
  }

  function handleReset() {
    setSelectedSymptoms(new Set());
    setDemographics({});
    setFirstName("");
    setEmail("");
    setPrivacyAccepted(false);
    setShowResults(false);
    setFormErrors([]);
  }

  async function handleSubmit() {
    const errors: string[] = [];

    if (!demographicsComplete) {
      errors.push("Beantwoord alle demografische vragen.");
    }
    if (!firstName.trim()) {
      errors.push("Vul je voornaam in.");
    }
    if (!isValidEmail(email)) {
      errors.push("Vul een geldig e-mailadres in.");
    }
    if (!privacyAccepted) {
      errors.push("Ga akkoord met het privacy- en cookiebeleid.");
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);
    setIsSubmitting(true);
    setShowResults(false);

    await new Promise((resolve) => setTimeout(resolve, 1800));

    setIsSubmitting(false);
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
          <div className="text-sm leading-relaxed text-amber-900/90 dark:text-amber-100/90">
            <p className="font-medium mb-1">Let op</p>
            <p>
              Deze test is een oriëntatiehulpmiddel en vervangt geen medische
              diagnose. Bij zorgen over stress of burn-out kun je contact
              opnemen met je huisarts of Walda Coaching.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Klachten &amp; symptomen bij stress
        </h2>
        <Card className="border-border/70 bg-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Invulinstructie voor de test</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {BURNOUT_TEST_INSTRUCTIONS.map((instruction) => (
                <li key={instruction} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {BURNOUT_SYMPTOM_CATEGORIES.map((category) => (
        <section key={category.id} className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{category.title}</h3>
            {category.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {category.description}
              </p>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {category.symptoms.map((symptom) => (
              <SymptomCheckbox
                key={symptom.id}
                id={symptom.id}
                label={symptom.label}
                checked={selectedSymptoms.has(symptom.id)}
                onCheckedChange={(checked) =>
                  toggleSymptom(symptom.id, checked)
                }
              />
            ))}
          </div>
        </section>
      ))}

      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Geselecteerd:{" "}
        <span className="font-medium text-foreground">{symptomCount}</span>{" "}
        {symptomCount === 1 ? "klacht" : "klachten"}
      </div>

      <Separator />

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Klachten &amp; symptomen bij stress
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {BURNOUT_RESEARCH_INTRO}
          </p>
        </div>

        {BURNOUT_DEMOGRAPHIC_QUESTIONS.map((question) => (
          <Card key={question.id} className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                {question.label}
                {question.required && (
                  <span className="text-destructive ml-0.5">*</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {question.options.map((option) => {
                const isSelected = demographics[question.id] === option.id;

                return (
                  <label
                    key={option.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:border-primary/30 hover:bg-accent/50",
                    )}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={isSelected}
                      onChange={() =>
                        handleDemographicChange(question.id, option.id)
                      }
                      className="h-4 w-4 accent-[hsl(var(--primary))]"
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator />

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Klachten &amp; symptomen bij stress
          </h2>
          <p className="text-sm text-muted-foreground">
            Vul hieronder jouw naam en e-mailadres in en klik op
            &apos;Resultaten bekijken&apos;. Dit kan even een paar seconden
            duren.
          </p>
        </div>

        <Card className="border-border/70">
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Voornaam<span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setShowResults(false);
                }}
                placeholder="Je voornaam"
                autoComplete="given-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                E-mailadres<span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setShowResults(false);
                }}
                placeholder="jouw@email.nl"
                autoComplete="email"
              />
            </div>

            <div className="space-y-3">
              <Label>
                Uw privacy<span className="text-destructive ml-0.5">*</span>
              </Label>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 px-4 py-3 text-sm">
                <Checkbox
                  checked={privacyAccepted}
                  onCheckedChange={(value) => {
                    setPrivacyAccepted(value === true);
                    setShowResults(false);
                  }}
                  className="mt-0.5"
                />
                <span className="leading-relaxed text-muted-foreground">
                  Ik ga akkoord met het{" "}
                  <a
                    href={BURNOUT_PRIVACY_POLICY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
                  >
                    privacy &amp; cookiebeleid
                  </a>
                  .
                  <span className="block mt-2">
                    We zullen je na akkoord mailen met tips, tools en
                    aanbiedingen aansluitend op jouw situatie. Bijvoorbeeld tips
                    voor meer energie, omgaan met stress, minder piekeren etc. Je
                    kunt je ten alle tijden weer uitschrijven.
                  </span>
                </span>
              </label>
            </div>
          </CardContent>
        </Card>
      </section>

      {formErrors.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <ul className="space-y-1">
            {formErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !contactComplete}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Resultaten laden…
            </>
          ) : (
            "Resultaten bekijken"
          )}
        </Button>
        <Button variant="outline" onClick={handleReset} disabled={isSubmitting}>
          <RotateCcw className="h-4 w-4" />
          Opnieuw invullen
        </Button>
        {!contactComplete && !isSubmitting && (
          <p className="text-sm text-muted-foreground">
            Vul je gegevens in en accepteer het privacybeleid om je resultaat te
            zien.
          </p>
        )}
      </div>

      {showResults && (
        <section className="space-y-6 pt-6 border-t border-border/60">
          <div>
            <h2 className="text-xl font-semibold mb-1">Jouw persoonlijke uitslag</h2>
            <CardDescription>
              Op basis van {symptomCount}{" "}
              {symptomCount === 1 ? "aangevinkte klacht" : "aangevinkte klachten"}.
            </CardDescription>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Uitslag burnout test</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultPanel
                result={result}
                symptomCount={symptomCount}
                firstName={firstName.trim()}
              />
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
