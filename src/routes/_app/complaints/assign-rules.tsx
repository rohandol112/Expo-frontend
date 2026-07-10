import { createFileRoute } from "@tanstack/react-router";
import { Settings2, Plus } from "lucide-react";
import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { useComplaintAssignRules, useCreateComplaintAssignRule, useComplaintCategories } from "@/hooks/api/useComplaints";
import { useUsers } from "@/hooks/api/useUsers";
import type { ComplaintAssignRule } from "@/services/complaintCategory.service";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/complaints/assign-rules")({ component: ComplaintAssignRulesPage });

function ComplaintAssignRulesPage() {
  const rulesQuery = useComplaintAssignRules({ per_page: 100 });
  const categoriesQuery = useComplaintCategories({ per_page: 100 });
  const usersQuery = useUsers({ per_page: 100 });
  const createRule = useCreateComplaintAssignRule();

  const [addRuleOpen, setAddRuleOpen] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [ruleDesc, setRuleDesc] = useState("");
  const [ruleCatId, setRuleCatId] = useState("");
  const [allSubCats, setAllSubCats] = useState(true);
  const [assigneeId, setAssigneeId] = useState("");

  const rows = rulesQuery.data?.items ?? [];
  const categories = categoriesQuery.data?.items ?? [];
  const officers = (usersQuery.data?.items ?? []).filter((u) => u.role === "Admin" || u.role === "Super Admin" || u.role === "Officer");

  const handleCreateRule = async () => {
    if (!ruleName.trim()) {
      toast.error("Rule name is required");
      return;
    }
    if (!ruleCatId) {
      toast.error("Please select a category");
      return;
    }
    if (!assigneeId) {
      toast.error("Please select an assigned officer");
      return;
    }

    try {
      await createRule.mutateAsync({
        name: ruleName.trim(),
        description: ruleDesc.trim() || undefined,
        category_id: Number(ruleCatId),
        all_sub_categories: allSubCats,
        sub_category_ids: [],
        assign_to: Number(assigneeId),
        is_active: true,
      });
      toast.success("Complaint assign rule created successfully");
      setAddRuleOpen(false);
      setRuleName("");
      setRuleDesc("");
      setRuleCatId("");
      setAllSubCats(true);
      setAssigneeId("");
    } catch {
      toast.error("Unable to create complaint assign rule");
    }
  };

  const columns: Column<ComplaintAssignRule>[] = [
    { key: "rule", header: "Rule", cell: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.description || "—"}</p></div> },
    { key: "category", header: "Category", cell: (row) => row.category?.name ?? "—" },
    { key: "assignee", header: "Assigned Officer", cell: (row) => row.assign_to?.name || `User #${row.assign_to?.id ?? "—"}` },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.is_active ? "Active" : "Inactive"} /> },
    { key: "created", header: "Created On", cell: (row) => row.created_at ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(row.created_at)) : "—" },
  ];

  return (
    <>
      <AdminListPage
        title="Complaint Assign Rules"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Complaints", to: ROUTES.COMPLAINTS }, { label: "Assign Rules" }]}
        stats={[{ title: "Total Rules", value: rows.length, icon: Settings2, variant: "violet" }]}
        actions={<Button onClick={() => setAddRuleOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Assign Rule</Button>}
        data={rows}
        columns={columns}
        rowKey={(row) => String(row.id)}
        loading={rulesQuery.isLoading}
        error={rulesQuery.error ? "Unable to load complaint assign rules from backend." : undefined}
        searchPlaceholder="Search assign rules..."
        filter={(row, search) => !search || [row.name, row.description || "", row.category?.name || "", row.assign_to?.name || ""].some((value) => value.toLowerCase().includes(search.toLowerCase()))}
      />

      <ConfirmDialog
        open={addRuleOpen}
        onOpenChange={setAddRuleOpen}
        title="Add Assign Rule"
        description="Configure routing rules to automatically assign complaints to specific officers."
        confirmLabel={createRule.isPending ? "Creating..." : "Create"}
        onConfirm={handleCreateRule}
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label>Rule Name *</Label>
            <Input value={ruleName} onChange={(e) => setRuleName(e.target.value)} placeholder="e.g. Cleanliness Routing" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={ruleDesc} onChange={(e) => setRuleDesc(e.target.value)} placeholder="Explain what this routing rule does" />
          </div>
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select value={ruleCatId} onValueChange={setRuleCatId}>
              <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
            <span>Apply to All Sub-categories</span>
            <Switch checked={allSubCats} onCheckedChange={setAllSubCats} />
          </div>
          <div className="space-y-1.5">
            <Label>Assign Officer *</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger><SelectValue placeholder="Select Officer" /></SelectTrigger>
              <SelectContent>
                {officers.length > 0 ? (
                  officers.map((off) => (
                    <SelectItem key={off.id} value={String(off.id)}>{off.name || `User #${off.id}`} ({off.role})</SelectItem>
                  ))
                ) : (
                  (usersQuery.data?.items ?? []).map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.name || `User #${u.id}`} ({u.role || "User"})</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ConfirmDialog>
    </>
  );
}
