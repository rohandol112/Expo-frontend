import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { X, ArrowLeft, ArrowRight, Send, Image as ImageIcon, Video, Pencil, Sparkles, CheckCircle2, AlertCircle, Circle, Plus, Calendar, Clock, Globe2, Lock, Send as SendIcon, FileEdit, Info } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Stepper } from "@/components/forms/Stepper";
import { FormSection } from "@/components/forms/FormSection";
import { FileUploadBox } from "@/components/forms/FileUploadBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ROUTES } from "@/constants/routes.constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  mockCategories,
  mockChannels,
  mockLanguages,
  mockStates,
  mockDistricts,
  mockAreas,
} from "@/mock/news.mock";

export const Route = createFileRoute("/_app/news/add")({
  component: AddNewsPage,
});

const STEPS = [
  { title: "Basic Information", description: "Add news basic details" },
  { title: "Multi Language Content", description: "Add content in multiple languages" },
  { title: "Visibility & Schedule", description: "Choose visibility and publish settings" },
];

const CONTENT_TYPES = ["Article", "Video", "Shorts", "Story"] as const;

function AddNewsPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  return (
    <div>
      <PageHeader
        title="Add News"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "News Management" },
          { label: "Admin News", to: ROUTES.NEWS_ADMIN },
          { label: "Add News" },
        ]}
        actions={
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: ROUTES.NEWS_ADMIN })}>
            <X className="h-5 w-5" />
          </Button>
        }
      />

      <div className="rounded-lg border bg-card p-6 mb-6">
        <Stepper steps={STEPS} current={step} />
      </div>

      {step === 0 && <Step1 />}
      {step === 1 && <Step2 />}
      {step === 2 && <Step3 />}

      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => (step === 0 ? navigate({ to: ROUTES.NEWS_ADMIN }) : setStep((s) => s - 1))}
        >
          {step === 0 ? "Cancel" : (<><ArrowLeft className="h-4 w-4 mr-1" /> Back</>)}
        </Button>
        <div className="flex gap-2">
          {step === 2 && (
            <Button variant="outline" onClick={() => toast.success("Saved as draft")}>
              Save as Draft
            </Button>
          )}
          <Button
            onClick={() => {
              if (step < 2) setStep((s) => s + 1);
              else {
                toast.success("News submitted successfully");
                navigate({ to: ROUTES.NEWS_ADMIN });
              }
            }}
          >
            {step < 2 ? (<>Save & Next <ArrowRight className="h-4 w-4 ml-1" /></>) : (<><Send className="h-4 w-4 mr-1" /> Submit</>)}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Step1() {
  const [contentType, setContentType] = useState<(typeof CONTENT_TYPES)[number]>("Article");
  const [visibility, setVisibility] = useState("all_india");

  return (
    <FormSection title="Basic Information">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="mb-1.5 block">Select Channel *</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select Channel" /></SelectTrigger>
            <SelectContent>
              {mockChannels.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Type of Content *</Label>
          <div className="grid grid-cols-4 rounded-md border p-1">
            {CONTENT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setContentType(t)}
                className={cn(
                  "rounded text-sm py-1.5 transition",
                  contentType === t ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block">Language *</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger>
            <SelectContent>
              {mockLanguages.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block">Categories *</Label>
        <Select>
          <SelectTrigger><SelectValue placeholder="Select Categories" /></SelectTrigger>
          <SelectContent>
            {mockCategories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border p-4 space-y-3">
        <Label>News Location *</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
            <SelectContent>{mockStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
            <SelectContent>{mockDistricts.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select><SelectTrigger><SelectValue placeholder="Select Area" /></SelectTrigger>
            <SelectContent>{mockAreas.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">This location will be used for tagging and default visibility.</p>
      </div>

      <div className="rounded-md border p-4 space-y-3">
        <Label>News Visibility *</Label>
        <RadioGroup value={visibility} onValueChange={setVisibility} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { v: "all_india", l: "All India", d: "" },
            { v: "by_state", l: "By State", d: "Select one or multiple states" },
            { v: "by_district", l: "By District", d: "Select one or multiple districts" },
            { v: "by_area", l: "By Area", d: "Select one or multiple areas" },
          ].map((o) => (
            <label key={o.v} className={cn("flex items-start gap-2 rounded-md border p-3 cursor-pointer", visibility === o.v && "border-primary bg-primary/5")}>
              <RadioGroupItem value={o.v} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">{o.l}</p>
                {o.d && <p className="text-xs text-muted-foreground">{o.d}</p>}
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="mb-1.5 block">Title *</Label>
        <Input placeholder="Enter news title (max 150 characters)" maxLength={150} />
      </div>

      <div>
        <Label className="mb-1.5 block">Description *</Label>
        <div className="rounded-md border">
          <div className="border-b bg-muted/40 px-3 py-2 text-xs text-muted-foreground flex items-center gap-3">
            <span>Paragraph ▾</span>
            <span className="font-bold">B</span>
            <span className="italic">I</span>
            <span className="underline">U</span>
            <span className="line-through">S</span>
          </div>
          <Textarea
            placeholder="Write news description here..."
            className="border-0 focus-visible:ring-0 min-h-[140px] rounded-t-none"
          />
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block">Source</Label>
        <Input placeholder="https://source-url.com" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Thumbnail Image *</Label>
          <FileUploadBox
            label="Upload Thumbnail"
            hint="Recommended size: 1280×720px • JPG, PNG (Max 2MB)"
            icon={ImageIcon}
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Video (Optional)</Label>
          <FileUploadBox
            label="Upload Video"
            hint="MP4, WebM, MOV (Max 100MB) • Recommended: 16:9 Ratio"
            icon={Video}
          />
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block">Bottom Description (Optional)</Label>
        <Input placeholder="Enter bottom description (will show below the content)" maxLength={300} />
      </div>
    </FormSection>
  );
}

const LANGS = [
  { name: "हिंदी (Hindi)", status: "Filled", isDefault: true },
  { name: "English", status: "Filled" },
  { name: "मराठी (Marathi)", status: "Filled" },
  { name: "தமிழ் (Tamil)", status: "Partial" },
  { name: "বাংলা (Bengali)", status: "Partial" },
  { name: "ગુજરાતી (Gujarati)", status: "Not Filled" },
] as const;

function Step2() {
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [active, setActive] = useState(0);

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold">Multi Language Content</h3>
          <p className="text-sm text-muted-foreground">Add news content in multiple languages</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
            <Sparkles className="h-4 w-4" /> Bulk Fill Options
          </span>
          <div className="flex rounded-md border p-1">
            <button
              onClick={() => setMode("manual")}
              className={cn("px-3 py-1.5 rounded text-sm inline-flex items-center gap-1.5", mode === "manual" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground")}
            >
              <Pencil className="h-3.5 w-3.5" /> Manual
            </button>
            <button
              onClick={() => setMode("ai")}
              className={cn("px-3 py-1.5 rounded text-sm inline-flex items-center gap-1.5", mode === "ai" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground")}
            >
              <Sparkles className="h-3.5 w-3.5" /> AI Auto Fill
            </button>
          </div>
        </div>
      </div>

      {mode === "ai" && (
        <div className="rounded-md border border-primary/20 bg-primary/5 p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-primary" /> AI Auto Fill</p>
            <p className="text-xs text-muted-foreground">Select all languages and add content in one language. AI will automatically generate content for other selected languages.</p>
          </div>
          <Button>AI Fill in All Selected Languages</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        <div className="space-y-2">
          {LANGS.map((l, i) => (
            <button
              key={l.name}
              onClick={() => setActive(i)}
              className={cn(
                "w-full text-left rounded-md border p-3 flex items-center justify-between transition",
                active === i && "border-emerald-400 bg-emerald-50/50",
              )}
            >
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{l.name}</span>
                {l.isDefault && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">Default</span>
                )}
              </div>
              <StatusPill status={l.status} />
            </button>
          ))}
          <Button variant="outline" className="w-full"><Plus className="h-4 w-4 mr-1" /> Add Language</Button>

          <div className="rounded-md border p-3 mt-4">
            <p className="text-sm font-semibold mb-2">Status Guide</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Filled <span className="text-muted-foreground">All fields are filled</span></div>
              <div className="flex items-center gap-2"><AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Partial <span className="text-muted-foreground">Some fields are empty</span></div>
              <div className="flex items-center gap-2"><Circle className="h-3.5 w-3.5 text-muted-foreground" /> Not Filled <span className="text-muted-foreground">No content added</span></div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-3">{LANGS[active].name}{" "}
            <span className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 ml-1">Default</span>
          </p>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Title *</Label>
              <Input placeholder={`Enter news title (max 150 characters)`} maxLength={150} />
            </div>
            <div>
              <Label className="mb-1.5 block">Description *</Label>
              <Textarea placeholder={`Write news description here...`} className="min-h-[180px]" />
            </div>
            <div>
              <Label className="mb-1.5 block">Bottom Description (Optional)</Label>
              <Input placeholder="Enter bottom description (will show below the content)" maxLength={300} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Filled: "text-emerald-600",
    Partial: "text-amber-600",
    "Not Filled": "text-muted-foreground",
  };
  const Icon = status === "Filled" ? CheckCircle2 : status === "Partial" ? AlertCircle : Circle;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", map[status])}>
      <Icon className="h-3.5 w-3.5" /> {status}
    </span>
  );
}

function Step3() {
  const [visibility, setVisibility] = useState("schedule");
  const [enablePoll, setEnablePoll] = useState(true);
  const [options, setOptions] = useState(["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]);

  const visTypes = [
    { v: "draft", label: "Draft", desc: "Save as draft. Only admin can see.", icon: FileEdit, color: "bg-blue-50 text-blue-600" },
    { v: "publish", label: "Publish", desc: "Publish now. Visible to selected audience.", icon: SendIcon, color: "bg-emerald-50 text-emerald-600" },
    { v: "private", label: "Private", desc: "Only selected people can view this news.", icon: Lock, color: "bg-amber-50 text-amber-600" },
    { v: "schedule", label: "Schedule", desc: "Schedule for later publish.", icon: Calendar, color: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      <FormSection
        title="Visibility & Schedule"
        description="Choose how and when the news will be visible to users"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          <div>
            <p className="text-sm font-semibold mb-1">Visibility Type <span className="text-muted-foreground font-normal">(Required)</span></p>
            <p className="text-xs text-muted-foreground mb-3">Choose who can see this news</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {visTypes.map((t) => {
                const Icon = t.icon;
                const active = visibility === t.v;
                return (
                  <button
                    key={t.v}
                    onClick={() => setVisibility(t.v)}
                    className={cn(
                      "text-left rounded-lg border p-4 transition",
                      active ? "border-primary ring-2 ring-primary/20" : "hover:border-input",
                    )}
                  >
                    <div className={cn("h-9 w-9 rounded-md flex items-center justify-center mb-3", t.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                    <div className="mt-3">
                      <span className={cn("inline-block h-3.5 w-3.5 rounded-full border-2", active ? "border-primary bg-primary" : "border-muted-foreground/40")} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm font-semibold mb-1 inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Schedule Publish <span className="text-xs text-muted-foreground font-normal">(for Schedule option)</span></p>
            <p className="text-xs text-muted-foreground mb-4">Select date and time to publish this news</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="mb-1.5 block text-xs">Publish Date</Label>
                <div className="relative">
                  <Input placeholder="24 May 2025" />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Publish Time</Label>
                <div className="relative">
                  <Input placeholder="10:30 AM" />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="relative">
              <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Select>
                <SelectTrigger className="pl-9">
                  <SelectValue placeholder="Asia/Kolkata (GMT +05:30)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ist">Asia/Kolkata (GMT +05:30)</SelectItem>
                  <SelectItem value="utc">UTC (GMT +00:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Enable Voting Poll <span className="ml-1 text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 font-normal">Optional</span></p>
              <p className="text-xs text-muted-foreground">Allow users to vote on a question related to this news</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={enablePoll} onCheckedChange={setEnablePoll} />
            <span className="text-sm">Enable voting poll</span>
          </div>
        </div>

        {enablePoll && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] gap-5 mt-2">
            <div>
              <Label className="mb-1.5 block">Poll Question *</Label>
              <Input placeholder="What is your opinion on this topic?" maxLength={200} />
            </div>
            <div>
              <Label className="mb-1.5 block">Poll Options *</Label>
              <div className="space-y-2">
                {options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-14">Option {i + 1}</span>
                    <Input
                      value={o}
                      onChange={(e) => setOptions((arr) => arr.map((x, idx) => (idx === i ? e.target.value : x)))}
                    />
                    <Button variant="ghost" size="icon" onClick={() => setOptions((arr) => arr.filter((_, idx) => idx !== i))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setOptions((arr) => [...arr, ""])}>
                  <Plus className="h-4 w-4 mr-1" /> Add Option
                </Button>
              </div>
            </div>
            <div className="rounded-md border bg-blue-50/50 border-blue-100 p-3 self-start">
              <p className="text-sm font-semibold inline-flex items-center gap-1.5 mb-1"><Info className="h-4 w-4 text-blue-600" /> Note</p>
              <p className="text-xs text-muted-foreground">Poll will be displayed below the news content to all eligible users after the news is published.</p>
            </div>
          </div>
        )}
      </FormSection>
    </div>
  );
}