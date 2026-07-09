"use client";

import { useMemo, useState } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  allQuestionsAnswered,
  calculateTotalScore,
  DEPRESSIETEST_QUESTIONS,
  getInterpretationForScore,
  type ScoreInterpretation,
} from "@/lib/walda/depressietest";
import { parseWikiText } from "@/components/walda/wiki-text";
import { cn } from "@/lib/utils";

function AdviceList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
          <span>{parseWikiText(item)}</span>
        </li>
      ))}
    </ul>
  );
}

function InterpretationPanel({
  interpretation,
  totalScore,
  variant,
}: {
  interpretation: ScoreInterpretation;
  totalScore: number;
  variant: "limited" | "extended";
}) {
  const content =
    variant === "limited" ? interpretation.limited : interpretation.extended;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <p className="text-sm font-medium text-primary mb-1">Jouw score</p>
        <p className="text-3xl font-semibold tracking-tight">{totalScore}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Scorebereik {interpretation.min} – {interpretation.max}:{" "}
          {interpretation.title}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">{interpretation.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {parseWikiText(content.summary)}
        </p>
      </div>

      {variant === "limited" ? (
        <div>
          <h4 className="text-sm font-semibold mb-3">Advies</h4>
          <AdviceList items={interpretation.limited.advice} />
        </div>
      ) : (
        <>
          <div>
            <h4 className="text-sm font-semibold mb-3">
              Wat kun je zelf zoveel mogelijk doen?
            </h4>
            <AdviceList items={interpretation.extended.selfHelp} />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">
              Wat zou ook goed kunnen helpen?
            </h4>
            <AdviceList items={interpretation.extended.additionalHelp} />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Adviezen</h4>
            <AdviceList items={interpretation.extended.advice} />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Verdiepende vragen</h4>
            <AdviceList items={interpretation.extended.reflectionQuestions} />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Opdracht voor 2 weken</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Beantwoord dagelijks:
            </p>
            <AdviceList items={interpretation.extended.twoWeekAssignment} />
          </div>
        </>
      )}
    </div>
  );
}

export function DepressietestClient() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const totalScore = useMemo(() => calculateTotalScore(answers), [answers]);
  const isComplete = allQuestionsAnswered(
    answers,
    DEPRESSIETEST_QUESTIONS.length,
  );
  const interpretation = getInterpretationForScore(totalScore);

  function handleAnswer(questionId: number, score: number) {
    setAnswers((current) => ({ ...current, [questionId]: score }));
    setShowResults(false);
  }

  function handleReset() {
    setAnswers({});
    setShowResults(false);
  }

  function handleCalculate() {
    if (isComplete) {
      setShowResults(true);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
          <div className="text-sm leading-relaxed text-amber-900/90 dark:text-amber-100/90">
            <p className="font-medium mb-1">Let op</p>
            <p>
              Deze vragenlijst is een oriëntatiehulpmiddel en vervangt geen
              medische diagnose. Bij zorgen over je stemming kun je contact
              opnemen met je huisarts of Walda Coaching.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Depressietest vragenlijst</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Beantwoord de onderstaande vragen door bij elke vraag het antwoord aan
          te kruisen dat het beste bij je gevoel of situatie van de afgelopen
          weken past.
        </p>
      </section>

      <div className="space-y-4">
        {DEPRESSIETEST_QUESTIONS.map((question) => (
          <Card key={question.id} className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium leading-snug">
                {question.id}. {question.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {question.options.map((option) => {
                const isSelected = answers[question.id] === option.score;

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
                      name={`question-${question.id}`}
                      value={option.score}
                      checked={isSelected}
                      onChange={() => handleAnswer(question.id, option.score)}
                      className="h-4 w-4 accent-[hsl(var(--primary))]"
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleCalculate} disabled={!isComplete} size="lg">
          Bereken mijn score
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
          Opnieuw invullen
        </Button>
        {!isComplete && (
          <p className="text-sm text-muted-foreground">
            Beantwoord alle {DEPRESSIETEST_QUESTIONS.length} vragen om je score te
            berekenen.
          </p>
        )}
      </div>

      {showResults && (
        <section className="space-y-6 pt-4 border-t border-border/60">
          <div>
            <h2 className="text-xl font-semibold mb-1">
              Uitleg en advies per scorebereik
            </h2>
            <p className="text-sm text-muted-foreground">
              Totaalscore: 0 t/m 21. Alle antwoordscores zijn bij elkaar opgeteld.
            </p>
          </div>

          <Tabs defaultValue="limited" className="w-full">
            <TabsList>
              <TabsTrigger value="limited">Beperkt advies</TabsTrigger>
              <TabsTrigger value="extended">Uitgebreid advies</TabsTrigger>
            </TabsList>
            <TabsContent value="limited" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interpretatie</CardTitle>
                  <CardDescription>
                    Kort overzicht en praktische adviezen op basis van je score.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InterpretationPanel
                    interpretation={interpretation}
                    totalScore={totalScore}
                    variant="limited"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="extended" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Uitgebreide interpretatie</CardTitle>
                  <CardDescription>
                    Diepgaand advies, verdiepende vragen en een opdracht voor twee
                    weken.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InterpretationPanel
                    interpretation={interpretation}
                    totalScore={totalScore}
                    variant="extended"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      )}

      <section className="rounded-xl border border-border/60 p-6 bg-muted/30">
        <h3 className="text-sm font-semibold mb-3">Scoresysteem per antwoord</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left">
                <th className="py-2 pr-4 font-medium">Vraag</th>
                <th className="py-2 pr-4 font-medium">Antwoordoptie</th>
                <th className="py-2 font-medium">Score</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {DEPRESSIETEST_QUESTIONS.map((question) =>
                question.options.map((option, index) => (
                  <tr
                    key={option.id}
                    className="border-b border-border/40 last:border-0"
                  >
                    <td className="py-2 pr-4 align-top">
                      {index === 0 ? question.id : ""}
                    </td>
                    <td className="py-2 pr-4">{option.label}</td>
                    <td className="py-2">{option.score}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="text-sm text-muted-foreground">
        <h3 className="font-semibold text-foreground mb-2">Meer</h3>
        <p>
          Zie ook:{" "}
          <a
            href="https://www.pgweb.nl/zelftest/depressie"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
          >
            Depressie test — Online zelftest (PsyQ / pgweb.nl)
          </a>
        </p>
      </section>
    </div>
  );
}
