import { createFileRoute } from "@tanstack/react-router";
import { Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage });

function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Settings" }]}
        actions={<Button onClick={() => toast.success("Settings saved locally")}><Save className="mr-2 h-4 w-4" />Save Changes</Button>}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsCard title="Website Information">
          <Field label="Website Name"><Input defaultValue="Pehli Baat" /></Field>
          <Field label="Website Admin Name"><Input defaultValue="Admin User" /></Field>
          <Field label="Support Email"><Input defaultValue="support@pehlibaat.com" /></Field>
          <div className="grid gap-4 md:grid-cols-2"><UploadBox label="Website Logo" /><UploadBox label="Website Favicon" /></div>
        </SettingsCard>

        <SettingsCard title="App Settings">
          <Field label="App Name"><Input defaultValue="Pehli Baat News" /></Field>
          <div className="grid gap-4 md:grid-cols-2"><UploadBox label="App Icon Square" /><UploadBox label="App Icon Rectangle" /></div>
          <UploadBox label="Splash Screen" />
          <ToggleRow label="Enable Splash Screen" defaultChecked />
        </SettingsCard>

        <SettingsCard title="Theme Settings">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Primary Color"><Input type="color" defaultValue="#ef3b3b" className="h-11" /></Field>
            <Field label="Secondary Color"><Input type="color" defaultValue="#111827" className="h-11" /></Field>
          </div>
        </SettingsCard>

        <SettingsCard title="Push Notification Settings">
          <ToggleRow label="Enable Push Notification" defaultChecked />
          <Field label="OneSignal App ID"><Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" /></Field>
          <Field label="OneSignal REST API Key"><Input type="password" placeholder="Enter REST API key" /></Field>
          <p className="text-sm text-primary">Need help? Open OneSignal setup guide.</p>
        </SettingsCard>

        <SettingsCard title="Force App Update Settings">
          <ToggleRow label="Android Update Enabled" />
          <Field label="Minimum Android Version"><Input placeholder="1.0.0" /></Field>
          <Field label="Android Update Message"><Textarea placeholder="Please update the app to continue." /></Field>
          <ToggleRow label="iOS Update Enabled" />
          <Field label="Minimum iOS Version"><Input placeholder="1.0.0" /></Field>
          <Field label="iOS Update Message"><Textarea placeholder="Please update the app to continue." /></Field>
        </SettingsCard>

        <SettingsCard title="Share Settings">
          <UploadBox label="Share Banner" />
          <Field label="Android App Schema"><Input placeholder="pehlibaat://" /></Field>
          <Field label="Play Store URL"><Input placeholder="https://play.google.com/store/apps/details?id=..." /></Field>
          <Field label="iOS App Schema"><Input placeholder="pehlibaat://" /></Field>
          <Field label="App Store URL"><Input placeholder="https://apps.apple.com/app/..." /></Field>
        </SettingsCard>

        <SettingsCard title="Translation Settings">
          <ToggleRow label="Enable AI Translation" />
          <Field label="OpenAI API Key"><Input type="password" placeholder="Enter OpenAI API key" /></Field>
          <Field label="Google Translation API Key"><Input type="password" placeholder="Enter Google Translation API key" /></Field>
          <ToggleRow label="Enable Auto Fill News Content" />
        </SettingsCard>

        <SettingsCard title="Monetization Settings">
          <ToggleRow label="Enable AdMob" defaultChecked />
          <Field label="Android App ID"><Input placeholder="ca-app-pub-..." /></Field>
          <Field label="iOS App ID"><Input placeholder="ca-app-pub-..." /></Field>
          <ToggleRow label="Enable Manual Ads" defaultChecked />
        </SettingsCard>
      </div>
    </div>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-base font-semibold">{title}</h2><div className="space-y-4">{children}</div></section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

function ToggleRow({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return <div className="flex items-center justify-between rounded-md border px-3 py-2.5"><Label>{label}</Label><Switch defaultChecked={defaultChecked} /></div>;
}

function UploadBox({ label }: { label: string }) {
  return (
    <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 p-4 text-center text-sm text-muted-foreground hover:bg-muted/40">
      <Upload className="mb-2 h-5 w-5" />
      <span className="font-medium text-foreground">{label}</span>
      <Input type="file" accept="image/*" className="sr-only" />
    </label>
  );
}
