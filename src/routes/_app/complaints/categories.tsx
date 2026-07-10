import { createFileRoute } from "@tanstack/react-router";
import { Tags, Plus } from "lucide-react";
import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { useComplaintCategories, useCreateComplaintCategory, useCreateComplaintSubCategory } from "@/hooks/api/useComplaints";
import type { ComplaintCategory } from "@/services/complaintCategory.service";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/complaints/categories")({ component: ComplaintCategoriesPage });

function ComplaintCategoriesPage() {
  const categoriesQuery = useComplaintCategories({ per_page: 100 });
  const createCategory = useCreateComplaintCategory();
  const createSubCategory = useCreateComplaintSubCategory();

  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catOrder, setCatOrder] = useState("1");
  const [catInst, setCatInst] = useState("");

  const [addSubCategoryOpen, setAddSubCategoryOpen] = useState(false);
  const [subParentId, setSubParentId] = useState("");
  const [subName, setSubName] = useState("");
  const [subDesc, setSubDesc] = useState("");

  const rows = categoriesQuery.data?.items ?? [];
  
  const handleCreateCategory = async () => {
    if (!catName.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      await createCategory.mutateAsync({
        name: catName.trim(),
        description: catDesc.trim() || undefined,
        display_order: Number(catOrder) || 1,
        instructions: catInst.trim() || undefined,
        is_active: true,
      });
      toast.success("Complaint category created successfully");
      setAddCategoryOpen(false);
      setCatName("");
      setCatDesc("");
      setCatOrder("1");
      setCatInst("");
    } catch {
      toast.error("Unable to create complaint category");
    }
  };

  const handleCreateSubCategory = async () => {
    if (!subParentId) {
      toast.error("Select a parent category");
      return;
    }
    if (!subName.trim()) {
      toast.error("Sub-category name is required");
      return;
    }
    try {
      await createSubCategory.mutateAsync({
        category_id: Number(subParentId),
        name: subName.trim(),
        description: subDesc.trim() || undefined,
        is_active: true,
      });
      toast.success("Complaint sub-category created successfully");
      setAddSubCategoryOpen(false);
      setSubParentId("");
      setSubName("");
      setSubDesc("");
    } catch {
      toast.error("Unable to create complaint sub-category");
    }
  };

  const columns: Column<ComplaintCategory>[] = [
    { key: "name", header: "Category", cell: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.description || "—"}</p></div> },
    { key: "icon", header: "Icon", cell: (row) => row.icon_url ? <img src={row.icon_url} alt="" className="h-10 w-10 rounded object-cover" /> : "—" },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.is_active ? "Active" : "Inactive"} /> },
    { key: "created", header: "Created On", cell: (row) => row.created_at ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(row.created_at)) : "—" },
  ];

  return (
    <>
      <AdminListPage
        title="Complaint Categories"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Complaints", to: ROUTES.COMPLAINTS }, { label: "Categories" }]}
        stats={[{ title: "Total Categories", value: rows.length, icon: Tags, variant: "blue" }]}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setAddCategoryOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Category</Button>
            <Button variant="outline" onClick={() => setAddSubCategoryOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Sub-category</Button>
          </div>
        }
        data={rows}
        columns={columns}
        rowKey={(row) => String(row.id)}
        loading={categoriesQuery.isLoading}
        error={categoriesQuery.error ? "Unable to load complaint categories from backend." : undefined}
        searchPlaceholder="Search complaint categories..."
        filter={(row, search) => !search || [row.name, row.description || ""].some((value) => value.toLowerCase().includes(search.toLowerCase()))}
      />

      <ConfirmDialog
        open={addCategoryOpen}
        onOpenChange={setAddCategoryOpen}
        title="Add Complaint Category"
        description="Fill in the details to create a new complaint category."
        confirmLabel={createCategory.isPending ? "Creating..." : "Create"}
        onConfirm={handleCreateCategory}
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label>Category Name *</Label>
            <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Garbage Dump" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Short category description" />
          </div>
          <div className="space-y-1.5">
            <Label>Display Order</Label>
            <Input type="number" min={1} value={catOrder} onChange={(e) => setCatOrder(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Instructions</Label>
            <Textarea value={catInst} onChange={(e) => setCatInst(e.target.value)} placeholder="Instructions for routing officers" />
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={addSubCategoryOpen}
        onOpenChange={setAddSubCategoryOpen}
        title="Add Complaint Sub-category"
        description="Select a parent category and add a sub-category."
        confirmLabel={createSubCategory.isPending ? "Creating..." : "Create"}
        onConfirm={handleCreateSubCategory}
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label>Parent Category *</Label>
            <Select value={subParentId} onValueChange={setSubParentId}>
              <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent>
                {rows.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Sub-category Name *</Label>
            <Input value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="e.g. Public Parks" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={subDesc} onChange={(e) => setSubDesc(e.target.value)} placeholder="Short sub-category description" />
          </div>
        </div>
      </ConfirmDialog>
    </>
  );
}
