import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, Gift, Lock, Pencil, Plus, Save, Trash2, Trophy } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { LocationTabs } from "@/components/admin/LocationTabs";
import { FormSection } from "@/components/forms/FormSection";
import { ImageUploadGrid } from "@/components/forms/ImageUploadGrid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  useAddQuizQuestion,
  useDailyQuizLocation,
  useDailyQuizLocations,
  useDeleteQuizQuestion,
  useSaveQuizSettings,
  useSaveTodaysGift,
  useUpdateQuizQuestion,
} from "@/hooks/api/useDailyQuiz";
import { useCompetitionLocations } from "@/hooks/api/useRewardsSettings";
import { formatDate, istToday } from "@/lib/format";
import type { ImageValue } from "@/lib/mediaUpload";
import type { DailyQuizLocation, QuizConfig, QuizQuestion } from "@/types/referrals";
import { ROUTES } from "@/constants/routes.constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals/daily-quiz")({ component: DailyQuizPage });

const OPTION_LETTERS = ["A", "B", "C", "D"];

/** Runs a save, leaving error toasts to the mutation hooks; resolves true on success. */
async function attempt(run: () => Promise<unknown>): Promise<boolean> {
  try {
    await run();
    return true;
  } catch {
    return false;
  }
}

function DailyQuizPage() {
  const [locationId, setLocationId] = useState("all");
  const [date, setDate] = useState(istToday());
  const locationsQuery = useCompetitionLocations();
  const overviewQuery = useDailyQuizLocations(date);
  const detailQuery = useDailyQuizLocation(locationId, date);
  const tabs = (locationsQuery.data?.items ?? []).map((l) => ({ id: l.id, label: l.title }));

  return (
    <div>
      <PageHeader
        title={locationId === "all" ? "All Locations - Daily Quiz" : "Daily Quiz"}
        description={
          locationId === "all"
            ? "View and manage daily quiz settings for all locations. Check quiz schedule, questions and points for Quiz 1 and Quiz 2."
            : "Create and manage daily quiz for different locations. Set schedule, questions, answer options, timer and points."
        }
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Daily Quiz" }]}
        actions={
          <div className="flex items-center gap-2">
            <Label htmlFor="quiz-date" className="text-sm text-muted-foreground">Quiz date</Label>
            <Input id="quiz-date" type="date" value={date} onChange={(e) => setDate(e.target.value || istToday())} className="w-[170px]" />
          </div>
        }
      />
      <LocationTabs locations={tabs} value={locationId} onChange={setLocationId} />
      {tabs.length === 0 && !locationsQuery.isLoading && (
        <div className="mb-4 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Add a competition location in Settings first. Each location runs its own daily quiz.
        </div>
      )}
      {locationId === "all" && (
        <AllLocationsTable locations={overviewQuery.data ?? []} onManage={setLocationId} loading={overviewQuery.isLoading} />
      )}
      {locationId !== "all" && detailQuery.isLoading && <div className="p-6 text-sm text-muted-foreground">Loading quiz…</div>}
      {locationId !== "all" && detailQuery.error && <div className="p-6 text-sm text-destructive">Unable to load this location's quiz.</div>}
      {locationId !== "all" && detailQuery.data && (
        <LocationQuizBuilder key={`${detailQuery.data.locationId}-${date}`} location={detailQuery.data} />
      )}
    </div>
  );
}

function QuizStatus({ quiz }: { quiz: QuizConfig }) {
  if (!quiz.quizId) return <StatusBadge status="Not Set" variant="red" />;
  return <StatusBadge status={quiz.isActive ? "Active" : "Inactive"} variant={quiz.isActive ? "green" : "amber"} />;
}

function AllLocationsTable({ locations, onManage, loading }: { locations: DailyQuizLocation[]; onManage: (id: string) => void; loading: boolean }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <th rowSpan={2} className="px-4 py-3 font-medium">Location</th>
            <th colSpan={4} className="border-l px-4 py-2 text-center font-medium">🏆 Quiz 1</th>
            <th colSpan={4} className="border-l px-4 py-2 text-center font-medium">🏆 Quiz 2</th>
            <th rowSpan={2} className="border-l px-4 py-3 font-medium">Today's Gift</th>
            <th rowSpan={2} className="border-l px-4 py-3 font-medium">Actions</th>
          </tr>
          <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            {["Time", "Questions", "Points", "Status", "Time", "Questions", "Points", "Status"].map((h, i) => (
              <th key={i} className={cn("px-4 py-2 font-medium", (i === 0 || i === 4) && "border-l")}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={11} className="px-4 py-6 text-center text-muted-foreground">Loading…</td></tr>
          )}
          {!loading && locations.length === 0 && (
            <tr><td colSpan={11} className="px-4 py-6 text-center text-muted-foreground">No competition locations yet</td></tr>
          )}
          {locations.map((loc) => (
            <tr key={loc.locationId} className="border-b last:border-0">
              <td className="px-4 py-3">
                <p className="font-medium">📍 {loc.locationLabel}</p>
                {!loc.isActive && <p className="text-xs text-muted-foreground">Inactive location</p>}
              </td>
              {[loc.quiz1, loc.quiz2].map((quiz, qi) => (
                <QuizSummaryCells key={qi} quiz={quiz} />
              ))}
              <td className="border-l px-4 py-3">{loc.todaysGift?.giftName ?? <span className="text-muted-foreground">Not set</span>}</td>
              <td className="border-l px-4 py-3">
                <Button variant="outline" size="sm" onClick={() => onManage(loc.locationId)}>Manage</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function QuizSummaryCells({ quiz }: { quiz: QuizConfig }) {
  const set = Boolean(quiz.quizId);
  return (
    <>
      <td className="whitespace-nowrap border-l px-4 py-3">{set ? `${quiz.startTime} - ${quiz.endTime}` : "-"}</td>
      <td className="px-4 py-3">{set ? quiz.totalQuestions : "-"}</td>
      <td className="px-4 py-3">{set ? (quiz.totalQuestions * quiz.pointsPerCorrect).toLocaleString() : "-"}</td>
      <td className="px-4 py-3"><QuizStatus quiz={quiz} /></td>
    </>
  );
}

function LocationQuizBuilder({ location }: { location: DailyQuizLocation }) {
  const saveTodaysGift = useSaveTodaysGift();
  const [giftName, setGiftName] = useState(location.todaysGift?.giftName ?? "");
  const [description, setDescription] = useState(location.todaysGift?.description ?? "");
  const [giftValue, setGiftValue] = useState(location.todaysGift?.giftValue != null ? String(location.todaysGift.giftValue) : "");
  const [photo, setPhoto] = useState<ImageValue[]>(location.todaysGift?.photo ? [location.todaysGift.photo] : []);

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between p-4">
        <div>
          <p className="flex items-center gap-2 font-semibold">📍 {location.locationLabel} · {formatDate(location.date)}</p>
          <p className="text-sm text-muted-foreground">
            Manage quiz 1 and quiz 2 for {location.locationLabel}. The first players in this location to answer every quiz of the day correctly win today's gift.
          </p>
        </div>
        <StatusBadge status={location.isActive ? "Active" : "Inactive"} />
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <QuizCard location={location} quiz={location.quiz1} accent="blue" />
        <QuizCard location={location} quiz={location.quiz2} accent="red" />
      </div>

      <FormSection title="Today's Gift" description={`The gift shown to users for the quiz on ${formatDate(location.date)}.`}>
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <ImageUploadGrid label="Gift Photo" hint="JPG, PNG, Max 2MB" value={photo} onChange={setPhoto} />
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <div className="space-y-2">
                <Label>Gift Name</Label>
                <Input value={giftName} onChange={(e) => setGiftName(e.target.value)} placeholder="Enter gift name" />
              </div>
              <div className="space-y-2">
                <Label>Value (₹)</Label>
                <Input type="number" min={0} value={giftValue} onChange={(e) => setGiftValue(e.target.value)} placeholder="e.g. 500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Enter description" />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            disabled={saveTodaysGift.isPending || !giftName.trim()}
            onClick={async () => {
              const saved = await attempt(() =>
                saveTodaysGift.mutateAsync({
                  locationId: location.locationId,
                  payload: { date: location.date, giftName, description, giftValue: giftValue === "" ? null : Math.round(Number(giftValue)), photo },
                }),
              );
              if (saved) toast.success("Today's gift saved");
            }}
          >
            <Save className="mr-2 h-4 w-4" />{saveTodaysGift.isPending ? "Saving..." : "Save Gift"}
          </Button>
        </div>
      </FormSection>
    </div>
  );
}

type QuizDraft = Pick<QuizConfig, "isActive" | "startTime" | "endTime" | "totalQuestions" | "pointsPerCorrect">;

function draftOf(quiz: QuizConfig): QuizDraft {
  return {
    isActive: quiz.isActive,
    startTime: quiz.startTime || (quiz.quizNumber === 1 ? "10:00" : "18:00"),
    endTime: quiz.endTime || (quiz.quizNumber === 1 ? "11:00" : "19:00"),
    totalQuestions: quiz.totalQuestions,
    pointsPerCorrect: quiz.pointsPerCorrect,
  };
}

function QuizCard({ location, quiz, accent }: { location: DailyQuizLocation; quiz: QuizConfig; accent: "blue" | "red" }) {
  const quizNumber = quiz.quizNumber;
  const saveSettings = useSaveQuizSettings();
  const deleteQuestion = useDeleteQuizQuestion();
  const [draft, setDraft] = useState<QuizDraft>(draftOf(quiz));
  const [questionDialog, setQuestionDialog] = useState<{ open: boolean; question?: QuizQuestion }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<QuizQuestion | null>(null);

  useEffect(() => {
    setDraft(draftOf(quiz));
  }, [quiz]);

  const borderClass = accent === "blue" ? "border-t-blue-500" : "border-t-red-500";
  const textClass = accent === "blue" ? "text-blue-700" : "text-red-700";
  const questions = quiz.questions;
  const locked = quiz.attemptCount > 0;
  const full = questions.length >= quiz.totalQuestions;
  const canAdd = Boolean(quiz.quizId) && !locked && !full;

  return (
    <Card className={cn("border-t-4 p-5", borderClass)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className={cn("flex items-center gap-2 text-base font-semibold", textClass)}>
          <Trophy className="h-4 w-4" /> Quiz {quizNumber}
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{draft.isActive ? "Active" : "Inactive"}</span>
          <Switch checked={draft.isActive} onCheckedChange={(v) => setDraft({ ...draft, isActive: v })} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Schedule Date</Label>
          <Input value={formatDate(location.date)} readOnly />
        </div>
        <div className="space-y-1.5">
          <Label>Start Time</Label>
          <Input type="time" value={draft.startTime} onChange={(e) => setDraft({ ...draft, startTime: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>End Time</Label>
          <Input type="time" value={draft.endTime} onChange={(e) => setDraft({ ...draft, endTime: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Total Questions</Label>
          <Input
            type="number"
            min={Math.max(1, questions.length)}
            max={50}
            value={draft.totalQuestions}
            onChange={(e) => setDraft({ ...draft, totalQuestions: Math.min(50, Math.max(1, Math.round(Number(e.target.value) || 1))) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Points per Correct Answer</Label>
          <Input type="number" min={0} value={draft.pointsPerCorrect} onChange={(e) => setDraft({ ...draft, pointsPerCorrect: Math.max(0, Math.round(Number(e.target.value) || 0)) })} />
        </div>
        <div className="space-y-1.5">
          <Label>Total Points (Max)</Label>
          <Input value={(draft.totalQuestions * draft.pointsPerCorrect).toLocaleString()} readOnly />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{quiz.quizId ? `${quiz.attemptCount} played so far` : "Not saved for this date yet"}</p>
        <Button
          size="sm"
          variant="outline"
          disabled={saveSettings.isPending || !draft.startTime || !draft.endTime}
          onClick={async () => {
            if (draft.endTime <= draft.startTime) {
              toast.error("End time must be after start time.");
              return;
            }
            const saved = await attempt(() =>
              saveSettings.mutateAsync({ locationId: location.locationId, quizNumber, payload: { ...draft, scheduleDate: location.date } }),
            );
            if (saved) toast.success(`Quiz ${quizNumber} settings saved`);
          }}
        >
          <Save className="mr-2 h-3.5 w-3.5" />{saveSettings.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h4 className="text-sm font-semibold">📋 Questions ({questions.length}/{quiz.totalQuestions})</h4>
        <Button size="sm" onClick={() => setQuestionDialog({ open: true })} disabled={!canAdd}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />Add Question
        </Button>
      </div>
      {!quiz.quizId && <p className="mt-1 text-xs text-muted-foreground">Save the settings first, then add questions.</p>}
      {quiz.quizId && full && !locked && <p className="mt-1 text-xs text-muted-foreground">All {quiz.totalQuestions} questions added. Raise Total Questions to add more.</p>}
      {locked && (
        <p className="mt-1 flex items-center gap-1 text-xs text-amber-700"><Lock className="h-3 w-3" />Users have started this quiz, so its questions can no longer change.</p>
      )}

      <div className="mt-2 overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">Question</th>
              <th className="px-3 py-2 font-medium">Options</th>
              <th className="px-3 py-2 font-medium">Correct</th>
              <th className="px-3 py-2 font-medium">Timer (Sec)</th>
              <th className="px-3 py-2 font-medium">Points</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">No questions yet</td></tr>
            )}
            {questions.map((q, i) => (
              <tr key={q.id} className="border-b last:border-0">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="max-w-[220px] truncate px-3 py-2">{q.text}</td>
                <td className="px-3 py-2"><span className="rounded-full border px-2 py-0.5 text-xs">{q.options.length} Options</span></td>
                <td className="px-3 py-2 font-medium">{OPTION_LETTERS[q.correctIndex]}</td>
                <td className="px-3 py-2"><span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{q.timerSeconds}</span></td>
                <td className="px-3 py-2"><span className="inline-flex items-center gap-1"><Gift className="h-3.5 w-3.5 text-muted-foreground" />{q.points}</span></td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={locked} onClick={() => setQuestionDialog({ open: true, question: q })} aria-label="Edit question">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" disabled={locked} onClick={() => setDeleteTarget(q)} aria-label="Delete question">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {quiz.quizId && (
        <QuestionDialog
          open={questionDialog.open}
          onOpenChange={(open) => setQuestionDialog({ open })}
          title={`${questionDialog.question ? "Edit" : "Add"} Question (Quiz ${quizNumber} - ${location.locationLabel})`}
          initial={questionDialog.question}
          quizId={quiz.quizId}
          defaultPoints={quiz.pointsPerCorrect}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete question?"
        description="This question will be removed from the quiz. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (!deleteTarget) return;
          const saved = await attempt(() => deleteQuestion.mutateAsync(deleteTarget.id));
          if (!saved) return;
          toast.success("Question deleted");
          setDeleteTarget(null);
        }}
      />
    </Card>
  );
}

function QuestionDialog({
  open,
  onOpenChange,
  title,
  initial,
  quizId,
  defaultPoints,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initial?: QuizQuestion;
  quizId: string;
  defaultPoints: number;
}) {
  const addQuestion = useAddQuizQuestion();
  const updateQuestion = useUpdateQuizQuestion();
  const [text, setText] = useState(initial?.text ?? "");
  const [options, setOptions] = useState<string[]>(initial?.options ?? ["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(initial?.correctIndex ?? 0);
  const [timerSeconds, setTimerSeconds] = useState(initial?.timerSeconds ?? 30);
  const [points, setPoints] = useState(initial?.points ?? defaultPoints);

  // Reset the form each time the dialog opens so it reflects the question being edited.
  useEffect(() => {
    if (!open) return;
    setText(initial?.text ?? "");
    setOptions(initial?.options ?? ["", "", "", ""]);
    setCorrectIndex(initial?.correctIndex ?? 0);
    setTimerSeconds(initial?.timerSeconds ?? 30);
    setPoints(initial?.points ?? defaultPoints);
  }, [open, initial, defaultPoints]);

  const saving = addQuestion.isPending || updateQuestion.isPending;

  const submit = async () => {
    if (!text.trim() || options.some((o) => !o.trim())) {
      toast.error("Please fill in the question and all four options.");
      return;
    }
    if (timerSeconds < 5 || timerSeconds > 600) {
      toast.error("The timer must be between 5 and 600 seconds.");
      return;
    }
    const payload = { text: text.trim(), options: options.map((o) => o.trim()), correctIndex, timerSeconds, points };
    const saved = await attempt(() =>
      initial ? updateQuestion.mutateAsync({ questionId: initial.id, payload }) : addQuestion.mutateAsync({ quizId, payload }),
    );
    if (!saved) return;
    toast.success(initial ? "Question updated" : "Question saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Enter question, options, correct answer, timer and points. Each question timer will be 30 seconds (adjustable).</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Question *</Label>
            <div className="relative">
              <Textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 200))} rows={2} placeholder="Enter question" />
              <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">{text.length}/200</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Options * <span className="text-xs text-muted-foreground">(4 options required)</span></Label>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold">{OPTION_LETTERS[i]}</span>
                <div className="relative flex-1">
                  <Input
                    value={opt}
                    maxLength={100}
                    onChange={(e) => setOptions(options.map((o, idx) => (idx === i ? e.target.value : o)))}
                    placeholder={`Option ${OPTION_LETTERS[i]}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">{opt.length}/100</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Correct Answer *</Label>
            <RadioGroup value={String(correctIndex)} onValueChange={(v) => setCorrectIndex(Number(v))} className="grid grid-cols-2 gap-2">
              {options.map((opt, i) => (
                <label
                  key={i}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm",
                    correctIndex === i && "border-primary bg-primary/5",
                  )}
                >
                  <RadioGroupItem value={String(i)} />
                  <span className="truncate">{OPTION_LETTERS[i]}. {opt || "—"}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Timer (Seconds) *</Label>
              <Input type="number" min={5} max={600} value={timerSeconds} onChange={(e) => setTimerSeconds(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">Each question will be shown to users for the selected time in seconds.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Points for Correct Answer *</Label>
              <Input type="number" min={0} value={points} onChange={(e) => setPoints(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">Points will be given to user for correct answer.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Saving..." : "Save Question"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
