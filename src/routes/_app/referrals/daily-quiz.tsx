import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, Gift, Pencil, Plus, Save, Trash2, Trophy } from "lucide-react";
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
  useDailyQuizLocations,
  useDeleteQuizQuestion,
  useSaveQuizSettings,
  useSaveTodaysGift,
  useUpdateQuizQuestion,
} from "@/hooks/api/useDailyQuiz";
import { DAILY_QUIZ_LOCATIONS } from "@/mock/dailyQuiz.mock";
import type { DailyQuizLocation, QuizConfig, QuizQuestion, TodaysGift } from "@/types/referrals";
import { ROUTES } from "@/constants/routes.constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals/daily-quiz")({ component: DailyQuizPage });

const OPTION_LETTERS = ["A", "B", "C", "D"];

function DailyQuizPage() {
  const [locationId, setLocationId] = useState("all");
  const locationsQuery = useDailyQuizLocations();
  const locations = locationsQuery.data ?? [];
  const selected = locations.find((l) => l.locationId === locationId);

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
      />

      <LocationTabs
        locations={DAILY_QUIZ_LOCATIONS.map((l) => ({ id: l.id, label: l.label }))}
        value={locationId}
        onChange={setLocationId}
      />

      {locationId === "all" && <AllLocationsTable locations={locations} onManage={setLocationId} loading={locationsQuery.isLoading} />}

      {locationId !== "all" && selected && <LocationQuizBuilder key={selected.locationId} location={selected} />}
    </div>
  );
}

function QuizStatus({ quiz }: { quiz: QuizConfig }) {
  const configured = Boolean(quiz.scheduleDate && quiz.startTime && quiz.totalQuestions > 0);
  return <StatusBadge status={configured ? "Active" : "Not Set"} variant={configured ? "green" : "red"} />;
}

function AllLocationsTable({ locations, onManage, loading }: { locations: DailyQuizLocation[]; onManage: (id: string) => void; loading: boolean }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <th rowSpan={2} className="px-4 py-3 font-medium">Location (Area, District, State)</th>
            <th colSpan={4} className="border-l px-4 py-2 text-center font-medium">🏆 Quiz 1</th>
            <th colSpan={4} className="border-l px-4 py-2 text-center font-medium">🏆 Quiz 2</th>
            <th rowSpan={2} className="border-l px-4 py-3 font-medium">Actions</th>
          </tr>
          <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            {["Time", "Questions", "Points", "Status", "Time", "Questions", "Points", "Status"].map((h, i) => (
              <th key={i} className={cn("px-4 py-2 font-medium", i === 0 && "border-l")}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={10} className="px-4 py-6 text-center text-muted-foreground">Loading…</td></tr>
          )}
          {locations.map((loc) => (
            <tr key={loc.locationId} className="border-b last:border-0">
              <td className="px-4 py-3">
                <p className="font-medium">📍 {loc.locationLabel}</p>
                <p className="text-xs text-muted-foreground">{loc.state}</p>
              </td>
              {[loc.quiz1, loc.quiz2].map((quiz, qi) => (
                <QuizSummaryCells key={qi} quiz={quiz} first={qi === 0} />
              ))}
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

function QuizSummaryCells({ quiz, first }: { quiz: QuizConfig; first: boolean }) {
  const time = quiz.startTime && quiz.endTime ? `${quiz.startTime} - ${quiz.endTime}` : "-";
  return (
    <>
      <td className={cn("whitespace-nowrap px-4 py-3", first && "border-l")}>{time}</td>
      <td className="px-4 py-3">{quiz.totalQuestions || "-"}</td>
      <td className="px-4 py-3">{quiz.totalQuestions ? (quiz.totalQuestions * quiz.pointsPerCorrect).toLocaleString() : "-"}</td>
      <td className="px-4 py-3"><QuizStatus quiz={quiz} /></td>
    </>
  );
}

function LocationQuizBuilder({ location }: { location: DailyQuizLocation }) {
  const saveTodaysGift = useSaveTodaysGift();
  const [gift, setGift] = useState<TodaysGift>(location.todaysGift);
  const [giftFile, setGiftFile] = useState<File[]>([]);

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between p-4">
        <div>
          <p className="flex items-center gap-2 font-semibold">📍 {location.locationLabel}, {location.state}</p>
          <p className="text-sm text-muted-foreground">Manage quiz 1 and quiz 2 for {location.locationLabel}. Each question will have 30 seconds timer.</p>
        </div>
        <StatusBadge status={location.isActive ? "Active" : "Inactive"} />
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <QuizCard location={location} quizNumber={1} accent="blue" />
        <QuizCard location={location} quizNumber={2} accent="red" />
      </div>

      <FormSection title="Today's Gift" description="Set the gift that will be displayed to users for today's quiz.">
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <ImageUploadGrid
            label="Gift Photo"
            hint="JPG, PNG, Max 2MB"
            value={giftFile}
            onChange={setGiftFile}
          />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Gift Name</Label>
              <Input value={gift.giftName} onChange={(e) => setGift({ ...gift, giftName: e.target.value })} placeholder="Enter gift name" />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea value={gift.description ?? ""} onChange={(e) => setGift({ ...gift, description: e.target.value })} rows={3} placeholder="Enter description" />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            disabled={saveTodaysGift.isPending || !gift.giftName.trim()}
            onClick={async () => {
              await saveTodaysGift.mutateAsync({
                locationId: location.locationId,
                payload: { ...gift, photo: giftFile[0]?.name ?? gift.photo },
              });
              toast.success("Today's gift saved");
            }}
          >
            <Save className="mr-2 h-4 w-4" />Save Gift
          </Button>
        </div>
      </FormSection>
    </div>
  );
}

function QuizCard({ location, quizNumber, accent }: { location: DailyQuizLocation; quizNumber: 1 | 2; accent: "blue" | "red" }) {
  const initial = quizNumber === 1 ? location.quiz1 : location.quiz2;
  const saveSettings = useSaveQuizSettings();
  const deleteQuestion = useDeleteQuizQuestion();
  const [draft, setDraft] = useState<Omit<QuizConfig, "questions" | "quizNumber">>({
    isActive: initial.isActive,
    scheduleDate: initial.scheduleDate,
    startTime: initial.startTime,
    endTime: initial.endTime,
    totalQuestions: initial.totalQuestions,
    pointsPerCorrect: initial.pointsPerCorrect,
  });
  const [questionDialog, setQuestionDialog] = useState<{ open: boolean; question?: QuizQuestion }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<QuizQuestion | null>(null);

  useEffect(() => {
    setDraft({
      isActive: initial.isActive,
      scheduleDate: initial.scheduleDate,
      startTime: initial.startTime,
      endTime: initial.endTime,
      totalQuestions: initial.totalQuestions,
      pointsPerCorrect: initial.pointsPerCorrect,
    });
  }, [initial]);

  const borderClass = accent === "blue" ? "border-t-blue-500" : "border-t-red-500";
  const textClass = accent === "blue" ? "text-blue-700" : "text-red-700";
  const questions = initial.questions;
  const totalPoints = questions.length * draft.pointsPerCorrect;

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
          <Input value={draft.scheduleDate} onChange={(e) => setDraft({ ...draft, scheduleDate: e.target.value })} placeholder="e.g. 28 Sep 2026" />
        </div>
        <div className="space-y-1.5">
          <Label>Start Time</Label>
          <Input value={draft.startTime} onChange={(e) => setDraft({ ...draft, startTime: e.target.value })} placeholder="e.g. 10:00 AM" />
        </div>
        <div className="space-y-1.5">
          <Label>End Time</Label>
          <Input value={draft.endTime} onChange={(e) => setDraft({ ...draft, endTime: e.target.value })} placeholder="e.g. 11:00 AM" />
        </div>
        <div className="space-y-1.5">
          <Label>Total Questions</Label>
          <Input value={`${questions.length} Questions`} readOnly />
        </div>
        <div className="space-y-1.5">
          <Label>Points per Correct Answer</Label>
          <Input type="number" value={draft.pointsPerCorrect} onChange={(e) => setDraft({ ...draft, pointsPerCorrect: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label>Total Points (Max)</Label>
          <Input value={totalPoints.toLocaleString()} readOnly />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          variant="outline"
          disabled={saveSettings.isPending}
          onClick={async () => {
            await saveSettings.mutateAsync({ locationId: location.locationId, quizNumber, payload: { ...draft, totalQuestions: questions.length } });
            toast.success(`Quiz ${quizNumber} settings saved`);
          }}
        >
          <Save className="mr-2 h-3.5 w-3.5" />Save Settings
        </Button>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h4 className="text-sm font-semibold">📋 Questions ({questions.length})</h4>
        <Button size="sm" onClick={() => setQuestionDialog({ open: true })}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />Add Question
        </Button>
      </div>

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
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setQuestionDialog({ open: true, question: q })} aria-label="Edit question">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(q)} aria-label="Delete question">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <QuestionDialog
        open={questionDialog.open}
        onOpenChange={(open) => setQuestionDialog({ open })}
        title={`${questionDialog.question ? "Edit" : "Add"} Question (Quiz ${quizNumber} - ${location.locationLabel})`}
        initial={questionDialog.question}
        locationId={location.locationId}
        quizNumber={quizNumber}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete question?"
        description="This question will be removed from the quiz. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteQuestion.mutateAsync({ locationId: location.locationId, quizNumber, questionId: deleteTarget.id });
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
  locationId,
  quizNumber,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initial?: QuizQuestion;
  locationId: string;
  quizNumber: 1 | 2;
}) {
  const addQuestion = useAddQuizQuestion();
  const updateQuestion = useUpdateQuizQuestion();
  const [text, setText] = useState(initial?.text ?? "");
  const [options, setOptions] = useState<string[]>(initial?.options ?? ["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(initial?.correctIndex ?? 0);
  const [timerSeconds, setTimerSeconds] = useState(initial?.timerSeconds ?? 30);
  const [points, setPoints] = useState(initial?.points ?? 100);

  // Reset the form each time the dialog opens so it reflects the question being edited.
  useEffect(() => {
    if (!open) return;
    setText(initial?.text ?? "");
    setOptions(initial?.options ?? ["", "", "", ""]);
    setCorrectIndex(initial?.correctIndex ?? 0);
    setTimerSeconds(initial?.timerSeconds ?? 30);
    setPoints(initial?.points ?? 100);
  }, [open, initial]);

  const saving = addQuestion.isPending || updateQuestion.isPending;

  const submit = async () => {
    if (!text.trim() || options.some((o) => !o.trim())) {
      toast.error("Please fill in the question and all four options.");
      return;
    }
    const payload = { text: text.trim(), options: options.map((o) => o.trim()), correctIndex, timerSeconds, points };
    if (initial) {
      await updateQuestion.mutateAsync({ locationId, quizNumber, questionId: initial.id, payload });
    } else {
      await addQuestion.mutateAsync({ locationId, quizNumber, payload });
    }
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
              <Input type="number" value={timerSeconds} onChange={(e) => setTimerSeconds(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">Each question will be shown to users for the selected time in seconds.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Points for Correct Answer *</Label>
              <Input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
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
