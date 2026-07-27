"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  allOpenAnswered,
  allProgressAnswered,
  allQuickscanAnswered,
  ATTENTION_THRESHOLD,
  buildProfileNarrative,
  calculateAllBlockScores,
  calculateProgressBlockScores,
  createEmptySession,
  DEEPENING_MODULES,
  describeChange,
  getModuleById,
  getRecommendedModules,
  getSignalLevel,
  inferDominantTargetGroups,
  isModuleComplete,
  LIKERT_LABELS,
  LIKERT_MAX,
  matchSignalProfiles,
  MEANINGFUL_CHANGE,
  OPEN_QUESTIONS,
  PROGRESS_ITEMS,
  QUICKSCAN_BLOCKS,
  QUICKSCAN_INSTRUCTION,
  REFLECTION_QUESTIONS,
  REPORT_CLOSING_QUESTIONS,
  SIGNAL_LEVEL_COLORS,
  SIGNAL_LEVEL_LABELS,
  STORAGE_KEY,
  type BlockId,
  type MeasurementMoment,
  type ModuleId,
  type StoredSession,
} from "@/lib/walda/loopbaanscan";

type Phase =
  | "intro"
  | "quickscan"
  | "open"
  | "results"
  | "module"
  | "progress"
  | "report";

const SCALE = [1, 2, 3, 4, 5] as const;

function LikertRow({
  questionId,
  text,
  value,
  onChange,
}: {
  questionId: string;
  text: string;
  value?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-card/40 p-4">
      <p className="text-sm leading-relaxed text-foreground">{text}</p>
      <div className="flex flex-wrap gap-2">
        {SCALE.map((n) => (
          <button
            key={`${questionId}-${n}`}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n}: ${LIKERT_LABELS[n]}`}
            className={cn(
              "flex h-11 min-w-11 flex-col items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors",
              value === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/70 bg-background hover:border-primary/40 hover:bg-primary/5",
            )}
          >
            <span>{n}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{LIKERT_LABELS[1]}</span>
        <span>{LIKERT_LABELS[5]}</span>
      </div>
    </div>
  );
}

function DomainBar({
  label,
  score,
  description,
}: {
  label: string;
  score: number;
  description: string;
}) {
  const level = getSignalLevel(score);
  const pct = Math.max(8, Math.min(100, (score / LIKERT_MAX) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold tabular-nums">{score.toFixed(1)}</p>
          <p
            className={cn(
              "text-[11px] font-medium",
              level === "ok" && "text-emerald-600",
              level === "attention" && "text-amber-600",
              level === "urgent" && "text-rose-600",
            )}
          >
            {SIGNAL_LEVEL_LABELS[level]}
          </p>
        </div>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", SIGNAL_LEVEL_COLORS[level])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function loadSession(): StoredSession {
  if (typeof window === "undefined") return createEmptySession();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptySession();
    const parsed = JSON.parse(raw) as StoredSession;
    if (parsed?.version !== 1) return createEmptySession();
    return parsed;
  } catch {
    return createEmptySession();
  }
}

function saveSession(session: StoredSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...session, updatedAt: new Date().toISOString() }),
  );
}

export function LoopbaanscanClient() {
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [blockIndex, setBlockIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  const [moduleAnswers, setModuleAnswers] = useState<
    Partial<Record<ModuleId, Record<string, string | number | string[]>>>
  >({});
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);
  const [progressMoment, setProgressMoment] = useState<MeasurementMoment>("T1");
  const [progressAnswers, setProgressAnswers] = useState<Record<string, number>>(
    {},
  );
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [progressHistory, setProgressHistory] = useState<
    StoredSession["progress"]
  >({});
  const [showCounselor, setShowCounselor] = useState(false);

  useEffect(() => {
    const session = loadSession();
    setAnswers(session.quickscanAnswers);
    setOpenAnswers(session.openAnswers);
    setModuleAnswers(session.moduleAnswers);
    setProgressHistory(session.progress);
    if (
      allQuickscanAnswered(session.quickscanAnswers) &&
      allOpenAnswered(session.openAnswers)
    ) {
      setPhase("results");
    }
    setReady(true);
  }, []);

  const persist = useCallback(
    (patch: Partial<StoredSession>) => {
      const next: StoredSession = {
        version: 1,
        updatedAt: new Date().toISOString(),
        quickscanAnswers: patch.quickscanAnswers ?? answers,
        openAnswers: patch.openAnswers ?? openAnswers,
        moduleAnswers: patch.moduleAnswers ?? moduleAnswers,
        progress: patch.progress ?? progressHistory,
      };
      saveSession(next);
    },
    [answers, openAnswers, moduleAnswers, progressHistory],
  );

  const blockScores = useMemo(
    () => calculateAllBlockScores(answers),
    [answers],
  );

  const recommendedModules = useMemo(
    () => (blockScores ? getRecommendedModules(blockScores) : []),
    [blockScores],
  );

  const signalProfiles = useMemo(
    () => (blockScores ? matchSignalProfiles(blockScores, answers) : []),
    [blockScores, answers],
  );

  const targetGroups = useMemo(
    () => (blockScores ? inferDominantTargetGroups(blockScores, answers) : []),
    [blockScores, answers],
  );

  const narrative = useMemo(
    () =>
      blockScores
        ? buildProfileNarrative(blockScores, answers, openAnswers)
        : "",
    [blockScores, answers, openAnswers],
  );

  const currentBlock = QUICKSCAN_BLOCKS[blockIndex];
  const blockComplete = currentBlock.questions.every(
    (q) => answers[q.id] != null,
  );

  function setAnswer(id: string, value: number) {
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      persist({ quickscanAnswers: next });
      return next;
    });
  }

  function setOpen(id: string, value: string) {
    setOpenAnswers((prev) => {
      const next = { ...prev, [id]: value };
      persist({ openAnswers: next });
      return next;
    });
  }

  function resetAll() {
    const empty = createEmptySession();
    saveSession(empty);
    setAnswers({});
    setOpenAnswers({});
    setModuleAnswers({});
    setProgressHistory({});
    setProgressAnswers({});
    setReflections({});
    setActiveModule(null);
    setBlockIndex(0);
    setPhase("intro");
    setShowCounselor(false);
  }

  function startModule(id: ModuleId) {
    setActiveModule(id);
    setPhase("module");
  }

  function updateModuleAnswer(
    moduleId: ModuleId,
    questionId: string,
    value: string | number | string[],
  ) {
    setModuleAnswers((prev) => {
      const next = {
        ...prev,
        [moduleId]: { ...(prev[moduleId] ?? {}), [questionId]: value },
      };
      persist({ moduleAnswers: next });
      return next;
    });
  }

  function saveProgressMeasurement() {
    if (!allProgressAnswered(progressAnswers)) return;
    if (progressMoment !== "T0") {
      const missing = REFLECTION_QUESTIONS.some(
        (q) => !reflections[q.id]?.trim(),
      );
      if (missing) return;
    }

    const nextHistory = {
      ...progressHistory,
      [progressMoment]: {
        answers: progressAnswers,
        reflections,
        completedAt: new Date().toISOString(),
      },
    };
    setProgressHistory(nextHistory);
    persist({ progress: nextHistory });
    setPhase("report");
  }

  function seedT0FromQuickscan(
    currentAnswers: Record<string, number> = answers,
    currentHistory: StoredSession["progress"] = progressHistory,
  ) {
    if (currentHistory.T0) return;
    const mapped: Record<string, number> = {};
    const map: Record<string, string> = {
      V1: "A1",
      V2: "B3",
      V3: "A2",
      V4: "B1",
      V5: "C1",
      V6: "D5",
      V7: "D3",
      V8: "E1",
      V9: "F1",
      V10: "E4",
      V11: "F5",
      V12: "F2",
    };
    for (const [v, q] of Object.entries(map)) {
      if (currentAnswers[q] != null) mapped[v] = currentAnswers[q];
    }
    if (!allProgressAnswered(mapped)) return;
    const nextHistory = {
      ...currentHistory,
      T0: {
        answers: mapped,
        reflections: {},
        completedAt: new Date().toISOString(),
      },
    };
    setProgressHistory(nextHistory);
    persist({ progress: nextHistory });
  }

  if (!ready) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Scan laden…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {phase === "intro" && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Instrument voor loopbaanbegeleiding
            </p>
            <CardTitle className="text-2xl">Walda Loopbaanscan</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {QUICKSCAN_INSTRUCTION}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: "Laag 1 · Quickscan",
                  body: "20–25 vragen · 10–12 minuten · profiel en signaalkleuren",
                },
                {
                  title: "Laag 2 · Verdieping",
                  body: "Alleen voor aandachtsdomeinen · 5–8 minuten per module",
                },
                {
                  title: "Laag 3 · Voortgang",
                  body: "Verkorte meting op T0, T1 en T2 met reflectievragen",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border/60 bg-muted/30 p-4"
                >
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground">
              Schaal: <strong className="text-foreground">1</strong> = helemaal
              niet / zelden → <strong className="text-foreground">5</strong> =
              (bijna) altijd. Antwoorden blijven lokaal op dit apparaat bewaard.
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setPhase("quickscan")}>
                Start quickscan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {allQuickscanAnswered(answers) && (
                <Button variant="outline" onClick={() => setPhase("results")}>
                  Naar resultaten
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "quickscan" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Blok {currentBlock.id} · {blockIndex + 1}/{QUICKSCAN_BLOCKS.length}
              </p>
              <h2 className="text-xl font-semibold tracking-tight">
                {currentBlock.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentBlock.description}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPhase("intro")}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Intro
            </Button>
          </div>

          <div className="flex gap-1.5">
            {QUICKSCAN_BLOCKS.map((block, i) => {
              const done = block.questions.every((q) => answers[q.id] != null);
              return (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => setBlockIndex(i)}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i === blockIndex
                      ? "bg-primary"
                      : done
                        ? "bg-primary/40"
                        : "bg-muted",
                  )}
                  aria-label={`Ga naar blok ${block.id}`}
                />
              );
            })}
          </div>

          <div className="space-y-3">
            {currentBlock.questions.map((q) => (
              <LikertRow
                key={q.id}
                questionId={q.id}
                text={q.text}
                value={answers[q.id]}
                onChange={(v) => setAnswer(q.id, v)}
              />
            ))}
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <Button
              variant="outline"
              disabled={blockIndex === 0}
              onClick={() => setBlockIndex((i) => i - 1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Vorige
            </Button>
            {blockIndex < QUICKSCAN_BLOCKS.length - 1 ? (
              <Button
                disabled={!blockComplete}
                onClick={() => setBlockIndex((i) => i + 1)}
              >
                Volgende blok
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                disabled={!allQuickscanAnswered(answers)}
                onClick={() => setPhase("open")}
              >
                Door naar open vragen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === "open" && (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Afsluiting quickscan
            </p>
            <h2 className="text-xl font-semibold tracking-tight">
              Drie korte vragen
            </h2>
          </div>

          <div className="space-y-5">
            {OPEN_QUESTIONS.map((q) => (
              <div key={q.id} className="space-y-2">
                <Label htmlFor={q.id} className="text-sm font-medium">
                  {q.text}
                </Label>
                <p className="text-xs text-muted-foreground">{q.hint}</p>
                {q.type === "choice" ? (
                  <div className="flex flex-col gap-2">
                    {q.options?.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setOpen(q.id, opt.id)}
                        className={cn(
                          "rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                          openAnswers[q.id] === opt.id
                            ? "border-primary bg-primary/5"
                            : "border-border/60 hover:border-primary/30",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    id={q.id}
                    value={openAnswers[q.id] ?? ""}
                    onChange={(e) => setOpen(q.id, e.target.value)}
                    rows={q.id === "Q1" ? 4 : 2}
                    className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <Button variant="outline" onClick={() => setPhase("quickscan")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug
            </Button>
            <Button
              disabled={!allOpenAnswered(openAnswers)}
              onClick={() => {
                seedT0FromQuickscan();
                setPhase("results");
              }}
            >
              Bekijk resultaten
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {phase === "results" && blockScores && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Quickscan · startmeting
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Jouw profielschets
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCounselor((v) => !v)}
              >
                <UserRound className="mr-2 h-4 w-4" />
                {showCounselor ? "Verberg begeleider" : "Begeleiderweergave"}
              </Button>
              <Button variant="ghost" size="sm" onClick={resetAll}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Opnieuw
              </Button>
            </div>
          </div>

          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed text-foreground/90">
                {narrative}
              </p>
              {targetGroups.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {targetGroups.map((g) => (
                    <span
                      key={g.id}
                      className="rounded-full border border-primary/30 bg-background/80 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Domeinen</CardTitle>
              <CardDescription>
                Drempel aandachtsgebied: gemiddelde ≤ {ATTENTION_THRESHOLD} (na
                spiegeling van negatieve items).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {QUICKSCAN_BLOCKS.map((block) => (
                <DomainBar
                  key={block.id}
                  label={`Blok ${block.id}: ${block.title}`}
                  score={blockScores[block.id]}
                  description={block.description}
                />
              ))}
            </CardContent>
          </Card>

          {openAnswers.Q1 && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Jouw woorden</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Aanleiding
                  </p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">
                    {openAnswers.Q1}
                  </p>
                </div>
                {openAnswers.Q2 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Wat mist
                    </p>
                    <p className="mt-1 leading-relaxed text-muted-foreground">
                      {openAnswers.Q2}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Aanbevolen verdieping</CardTitle>
              <CardDescription>
                Modules op basis van aandachtsdomeinen in de quickscan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedModules.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Geen sterke aandachtsdomeinen. Modules kunnen desgewenst op
                  initiatief van de begeleider worden ingezet.
                </p>
              ) : (
                recommendedModules.map((id) => {
                  const mod = getModuleById(id)!;
                  const done = isModuleComplete(id, moduleAnswers[id] ?? {});
                  return (
                    <div
                      key={id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{mod.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {mod.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={done ? "outline" : "default"}
                        onClick={() => startModule(id)}
                      >
                        {done ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Bekijken
                          </>
                        ) : (
                          "Start module"
                        )}
                      </Button>
                    </div>
                  );
                })
              )}
              <Separator className="my-2" />
              <div className="flex flex-wrap gap-2">
                {DEEPENING_MODULES.filter(
                  (m) => !recommendedModules.includes(m.id),
                ).map((m) => (
                  <Button
                    key={m.id}
                    size="sm"
                    variant="ghost"
                    onClick={() => startModule(m.id)}
                  >
                    {m.title}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {showCounselor && (
            <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  Begeleider · signaalprofielen & interventies
                </CardTitle>
                <CardDescription>
                  Voorstel op basis van blokscores en specifieke items.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {signalProfiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Geen specifiek signaalprofiel geactiveerd. Gebruik de
                    domeinscores en open antwoorden als gespreksingang.
                  </p>
                ) : (
                  signalProfiles.map((profile) => (
                    <div key={profile.id} className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold">{profile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {profile.core}
                        </p>
                      </div>
                      <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
                        {profile.interventions.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  ))
                )}

                {targetGroups.length > 0 && (
                  <div className="space-y-3 border-t border-border/50 pt-4">
                    <p className="text-sm font-semibold">Doelgroepkenmerken</p>
                    {targetGroups.map((g) => (
                      <div key={g.id} className="text-sm">
                        <p className="font-medium">{g.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Kernvraag: {g.coreQuestion}
                        </p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                          {g.recognition.map((r) => (
                            <li key={r}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                setProgressMoment(
                  progressHistory.T1 ? "T2" : progressHistory.T0 ? "T1" : "T0",
                );
                setProgressAnswers({});
                setReflections({});
                setPhase("progress");
              }}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Voortgangsmeting
            </Button>
            {(progressHistory.T0 || progressHistory.T1 || progressHistory.T2) && (
              <Button variant="outline" onClick={() => setPhase("report")}>
                Rapportage bekijken
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === "module" && activeModule && (
        <ModuleView
          moduleId={activeModule}
          answers={moduleAnswers[activeModule] ?? {}}
          onChange={(qid, value) =>
            updateModuleAnswer(activeModule, qid, value)
          }
          onBack={() => setPhase("results")}
        />
      )}

      {phase === "progress" && (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Voortgangsmeting
            </p>
            <h2 className="text-xl font-semibold tracking-tight">
              Moment {progressMoment}
            </h2>
            <p className="text-sm text-muted-foreground">
              Verkorte quickscan (12 items)
              {progressMoment !== "T0" ? " + drie reflectievragen" : ""}.
            </p>
          </div>

          <Tabs
            value={progressMoment}
            onValueChange={(v) => {
              setProgressMoment(v as MeasurementMoment);
              const existing = progressHistory[v as MeasurementMoment];
              setProgressAnswers(existing?.answers ?? {});
              setReflections(existing?.reflections ?? {});
            }}
          >
            <TabsList>
              <TabsTrigger value="T0">T0 start</TabsTrigger>
              <TabsTrigger value="T1">T1 tussen</TabsTrigger>
              <TabsTrigger value="T2">T2 eind</TabsTrigger>
            </TabsList>
            <TabsContent value={progressMoment} className="mt-4 space-y-4">
              {PROGRESS_ITEMS.map((item) => (
                <LikertRow
                  key={item.id}
                  questionId={item.id}
                  text={item.text}
                  value={progressAnswers[item.id]}
                  onChange={(v) =>
                    setProgressAnswers((prev) => ({ ...prev, [item.id]: v }))
                  }
                />
              ))}

              {progressMoment !== "T0" && (
                <div className="space-y-5 pt-2">
                  <Separator />
                  <h3 className="text-sm font-semibold">Reflectievragen</h3>
                  {REFLECTION_QUESTIONS.map((q) => (
                    <div key={q.id} className="space-y-2">
                      <Label htmlFor={q.id}>{q.text}</Label>
                      <p className="text-xs text-muted-foreground">{q.hint}</p>
                      <textarea
                        id={q.id}
                        value={reflections[q.id] ?? ""}
                        onChange={(e) =>
                          setReflections((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap justify-between gap-3">
            <Button variant="outline" onClick={() => setPhase("results")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug
            </Button>
            <Button
              disabled={
                !allProgressAnswered(progressAnswers) ||
                (progressMoment !== "T0" &&
                  REFLECTION_QUESTIONS.some((q) => !reflections[q.id]?.trim()))
              }
              onClick={saveProgressMeasurement}
            >
              Opslaan & rapportage
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {phase === "report" && (
        <ReportView
          narrative={narrative}
          blockScores={blockScores}
          progressHistory={progressHistory}
          onBack={() => setPhase("results")}
        />
      )}
    </div>
  );
}

function ModuleView({
  moduleId,
  answers,
  onChange,
  onBack,
}: {
  moduleId: ModuleId;
  answers: Record<string, string | number | string[]>;
  onChange: (questionId: string, value: string | number | string[]) => void;
  onBack: () => void;
}) {
  const mod = getModuleById(moduleId);
  if (!mod) return null;
  const complete = isModuleComplete(moduleId, answers);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Verdiepingsmodule {mod.id}
          </p>
          <h2 className="text-xl font-semibold tracking-tight">{mod.title}</h2>
          <p className="text-sm text-muted-foreground">{mod.description}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Resultaten
        </Button>
      </div>

      <div className="space-y-5">
        {mod.questions.map((q) => {
          const raw = answers[q.id];

          if (q.type === "likert") {
            return (
              <LikertRow
                key={q.id}
                questionId={q.id}
                text={q.text}
                value={typeof raw === "number" ? raw : undefined}
                onChange={(v) => onChange(q.id, v)}
              />
            );
          }

          if (q.type === "scale10") {
            const value = typeof raw === "number" ? raw : undefined;
            return (
              <div
                key={q.id}
                className="space-y-3 rounded-xl border border-border/60 p-4"
              >
                <p className="text-sm">{q.text}</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => onChange(q.id, n)}
                      className={cn(
                        "h-10 w-10 rounded-lg border text-sm font-medium",
                        value === n
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/70 hover:border-primary/40",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          if (q.type === "multi") {
            const selected = Array.isArray(raw) ? raw : [];
            const max = q.maxSelections ?? 3;
            return (
              <div
                key={q.id}
                className="space-y-3 rounded-xl border border-border/60 p-4"
              >
                <p className="text-sm">{q.text}</p>
                <p className="text-xs text-muted-foreground">
                  Kies maximaal {max} ({selected.length}/{max})
                </p>
                <div className="flex flex-wrap gap-2">
                  {q.options?.map((opt) => {
                    const active = selected.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (active) {
                            onChange(
                              q.id,
                              selected.filter((id) => id !== opt.id),
                            );
                          } else if (selected.length < max) {
                            onChange(q.id, [...selected, opt.id]);
                          }
                        }}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/70 hover:border-primary/40",
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (q.type === "choice" || q.type === "agree") {
            return (
              <div
                key={q.id}
                className="space-y-3 rounded-xl border border-border/60 p-4"
              >
                <p className="text-sm">{q.text}</p>
                <div className="flex flex-col gap-2">
                  {q.options?.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChange(q.id, opt.id)}
                      className={cn(
                        "rounded-lg border px-4 py-3 text-left text-sm",
                        raw === opt.id
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:border-primary/30",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={q.id} className="space-y-2">
              <Label htmlFor={q.id}>{q.text}</Label>
              <textarea
                id={q.id}
                value={typeof raw === "string" ? raw : ""}
                onChange={(e) => onChange(q.id, e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          Terug naar resultaten
        </Button>
        {complete && (
          <p className="flex items-center text-sm text-emerald-600">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Module opgeslagen
          </p>
        )}
      </div>
    </div>
  );
}

function ReportView({
  narrative,
  blockScores,
  progressHistory,
  onBack,
}: {
  narrative: string;
  blockScores: Record<BlockId, number> | null;
  progressHistory: StoredSession["progress"];
  onBack: () => void;
}) {
  const moments: MeasurementMoment[] = ["T0", "T1", "T2"];
  const available = moments.filter((m) => progressHistory[m]);

  const progressScores = useMemo(() => {
    const map: Partial<Record<MeasurementMoment, Record<BlockId, number>>> = {};
    for (const m of available) {
      const scored = calculateProgressBlockScores(
        progressHistory[m]!.answers,
      );
      if (scored) map[m] = scored;
    }
    return map;
  }, [available, progressHistory]);

  const reflections = [
    progressHistory.T1?.reflections,
    progressHistory.T2?.reflections,
  ].filter(Boolean) as Record<string, string>[];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Voortgangsrapportage
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Jouw ontwikkeling
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Terug
        </Button>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">A. Jouw profiel bij aanvang</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {narrative ||
              "Rond eerst de quickscan af om een startprofiel te genereren."}
          </p>
          {blockScores && (
            <div className="space-y-4">
              {QUICKSCAN_BLOCKS.map((block) => (
                <DomainBar
                  key={block.id}
                  label={block.title}
                  score={blockScores[block.id]}
                  description={block.description}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">B. Jouw ontwikkeling in beeld</CardTitle>
          <CardDescription>
            Vergelijking van domeinscores over meetmomenten. Klinisch
            betekenisvolle verandering: ±{MEANINGFUL_CHANGE} punt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nog geen voortgangsmetingen opgeslagen.
            </p>
          ) : (
            QUICKSCAN_BLOCKS.map((block) => {
              const t0 = progressScores.T0?.[block.id];
              const t1 = progressScores.T1?.[block.id];
              const t2 = progressScores.T2?.[block.id];
              const latest = t2 ?? t1;
              const change =
                t0 != null && latest != null
                  ? describeChange(t0, latest)
                  : null;

              return (
                <div
                  key={block.id}
                  className="rounded-xl border border-border/60 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{block.title}</p>
                    {change && (
                      <span
                        className={cn(
                          "text-xs font-medium",
                          change === "improved" && "text-emerald-600",
                          change === "declined" && "text-rose-600",
                          change === "stable" && "text-muted-foreground",
                        )}
                      >
                        {change === "improved" && "Vooruitgang"}
                        {change === "declined" && "Meer aandacht nodig"}
                        {change === "stable" && "Stabiel"}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {t0 != null && (
                      <span>
                        T0:{" "}
                        <strong className="text-foreground">
                          {t0.toFixed(1)}
                        </strong>
                      </span>
                    )}
                    {t1 != null && (
                      <span>
                        T1:{" "}
                        <strong className="text-foreground">
                          {t1.toFixed(1)}
                        </strong>
                      </span>
                    )}
                    {t2 != null && (
                      <span>
                        T2:{" "}
                        <strong className="text-foreground">
                          {t2.toFixed(1)}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">C. Wat jij hebt gedaan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {reflections.length === 0 ? (
            <p>
              Reflectieantwoorden verschijnen hier na de tussen- en eindmeting.
            </p>
          ) : (
            reflections.map((ref, idx) => (
              <div key={idx} className="space-y-2 rounded-xl bg-muted/30 p-4">
                {ref.R1 && (
                  <p>
                    <span className="font-medium text-foreground">
                      Verandering:{" "}
                    </span>
                    {ref.R1}
                  </p>
                )}
                {ref.R2 && (
                  <p>
                    <span className="font-medium text-foreground">
                      Helpend inzicht:{" "}
                    </span>
                    {ref.R2}
                  </p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">D. Richting voor verder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(progressHistory.T2?.reflections.R3 ||
            progressHistory.T1?.reflections.R3) && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                Concrete volgende stap:{" "}
              </span>
              {progressHistory.T2?.reflections.R3 ??
                progressHistory.T1?.reflections.R3}
            </p>
          )}
          <div>
            <p className="text-sm font-medium mb-2">
              Vragen om bij jezelf te blijven stellen
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {REPORT_CLOSING_QUESTIONS.map((q) => (
                <li key={q.id} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                  <span>{q.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
