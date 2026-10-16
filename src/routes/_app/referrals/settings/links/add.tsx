import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateImportantLink, useUpdateImportantLink } from "@/hooks/api/useRewardsSettings";
import type { ImportantLink } from "@/types/referrals";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals/settings/links/add")({ component: AddLinkPage });

function AddLinkPage() {
  const navigate = useNavigate();
  return <LinkForm onDone={() => navigate({ to: ROUTES.REFERRALS_SETTINGS })} />;
}

function isEmptyHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").trim().length === 0;
}

export function LinkForm({ onDone, initial }: { onDone: () => void; initial?: ImportantLink }) {
  const createLink = useCreateImportantLink();
  const updateLink = useUpdateImportantLink();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<"Active" | "Inactive">((initial?.status as "Active" | "Inactive") ?? "Active");
  const saving = createLink.isPending || updateLink.isPending;

  const submit = async () => {
    if (!title.trim() || isEmptyHtml(description)) {
      toast.error("Please enter a title and description.");
      return;
    }
    const payload = { title: title.trim(), description, status };
    try {
      if (initial) {
        await updateLink.mutateAsync({ id: initial.id, payload });
      } else {
        await createLink.mutateAsync(payload);
      }
    } catch {
      return;
    }
    toast.success(initial ? "Link updated" : "Link saved");
    onDone();
  };

  return (
    <div>
      <PageHeader
        title={initial ? "Edit Important Link" : "Add Important Link"}
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Referrals & Points", to: ROUTES.REFERRALS },
          { label: "Settings", to: ROUTES.REFERRALS_SETTINGS },
          { label: initial ? "Edit Important Link" : "Add Important Link" },
        ]}
      />

      <FormSection>
        <div className="space-y-2">
          <Label>Title <span className="text-destructive">*</span></Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title (e.g. Terms & Conditions)" />
        </div>
        <div className="space-y-2">
          <Label>Description <span className="text-destructive">*</span></Label>
          <RichTextEditor value={description} onChange={setDescription} placeholder="Enter description..." />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as "Active" | "Inactive")}>
            <SelectTrigger className="max-w-[240px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FormSection>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onDone}>Cancel</Button>
        <Button onClick={submit} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : initial ? "Save Changes" : "Save Link"}</Button>
      </div>
    </div>
  );
}
