import { createFileRoute } from "@tanstack/react-router";
import { Tags, Plus, ImageIcon } from "lucide-react";
import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ROUTES } from "@/constants/routes.constants";
import {
  useComplaintCategories,
  useComplaintSubCategories,
  useCreateComplaintCategory,
  useUpdateComplaintCategory,
  useUpdateComplaintCategoryStatus,
  useComplaintCategoryIconUploadUrl,
  useCreateComplaintSubCategory,
  useUpdateComplaintSubCategory,
  useUpdateComplaintSubCategoryStatus,
} from "@/hooks/api/useComplaints";
import type { ComplaintCategory, ComplaintSubCategory } from "@/services/complaintCategory.service";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/complaints/categories")({ component: ComplaintCategoriesPage });

function formatDateTime(value?: string) {
  return value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—";
}

function ComplaintCategoriesPage() {
  const categoriesQuery = useComplaintCategories({ per_page: 100 });
  const subCategoriesQuery = useComplaintSubCategories({ per_page: 100 });
  const createCategory = useCreateComplaintCategory();
  const updateCategory = useUpdateComplaintCategory();
  const updateCategoryStatus = useUpdateComplaintCategoryStatus();
  const uploadIconMutation = useComplaintCategoryIconUploadUrl();
  const createSubCategory = useCreateComplaintSubCategory();
  const updateSubCategory = useUpdateComplaintSubCategory();
  const updateSubCategoryStatus = useUpdateComplaintSubCategoryStatus();

  const [categoryDialog, setCategoryDialog] = useState<{ mode: "add" | "edit"; target?: ComplaintCategory } | null>(null);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catOrder, setCatOrder] = useState("1");
  const [catInst, setCatInst] = useState("");
  const [catIconKey, setCatIconKey] = useState("");
  const [catIconPreview, setCatIconPreview] = useState("");

  const [subDialog, setSubDialog] = useState<{ mode: "add" | "edit"; target?: ComplaintSubCategory } | null>(null);
  const [subParentId, setSubParentId] = useState("");
  const [subName, setSubName] = useState("");
  const [subDesc, setSubDesc] = useState("");

  const rows = categoriesQuery.data?.items ?? [];
  const subRows = subCategoriesQuery.data?.items ?? [];

  const openAddCategory = () => {
    setCatName("");
    setCatDesc("");
    setCatOrder("1");
    setCatInst("");
    setCatIconKey("");
    setCatIconPreview("");
    setCategoryDialog({ mode: "add" });
  };

  const openEditCategory = (row: ComplaintCategory) => {
    setCatName(row.name);
    setCatDesc(row.description ?? "");
    setCatOrder(String(row.display_order));
    setCatInst(row.instructions ?? "");
    setCatIconKey("");
    setCatIconPreview(row.icon_url ?? "");
    setCategoryDialog({ mode: "edit", target: row });
  };

  const handleUploadIcon = (file: File | null) => {
    if (!file) return;
    setCatIconPreview(URL.createObjectURL(file));
    uploadIconMutation.mutate(
      { file_name: file.name, content_type: file.type || "image/png" },
      {
        onSuccess: async (result) => {
          try {
            await fetch(result.upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type || "image/png" } });
            setCatIconKey(result.file_key);
            toast.success("Icon uploaded.");
          } catch {
            toast.error("Failed to upload icon to storage.");
          }
        },
        onError: (err) => toast.error(err.message || "Failed to generate upload URL."),
      }
    );
  };

  const handleSaveCategory = async () => {
    if (!catName.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      const payload = {
        name: catName.trim(),
        description: catDesc.trim() || undefined,
        display_order: Number(catOrder) || 1,
        instructions: catInst.trim() || undefined,
        ...(catIconKey ? { icon_key: catIconKey } : {}),
      };
      if (categoryDialog?.mode === "edit" && categoryDialog.target) {
        await updateCategory.mutateAsync({ id: categoryDialog.target.id, payload });
        toast.success("Complaint category updated successfully");
      } else {
        await createCategory.mutateAsync({ ...payload, is_active: true });
        toast.success("Complaint category created successfully");
      }
      setCategoryDialog(null);
    } catch {
      toast.error("Unable to save complaint category");
    }
  };

  const openAddSubCategory = () => {
    setSubParentId("");
    setSubName("");
    setSubDesc("");
    setSubDialog({ mode: "add" });
  };

  const openEditSubCategory = (row: ComplaintSubCategory) => {
    setSubParentId(String(row.category_id));
    setSubName(row.name);
    setSubDesc(row.description ?? "");
    setSubDialog({ mode: "edit", target: row });
  };

  const handleSaveSubCategory = async () => {
    if (!subParentId) {
      toast.error("Select a parent category");
      return;
    }
    if (!subName.trim()) {
      toast.error("Sub-category name is required");
      return;
    }
    try {
      if (subDialog?.mode === "edit" && subDialog.target) {
        await updateSubCategory.mutateAsync({ id: subDialog.target.id, payload: { name: subName.trim(), description: subDesc.trim() || undefined } });
        toast.success("Complaint sub-category updated successfully");
      } else {
        await createSubCategory.mutateAsync({ category_id: Number(subParentId), name: subName.trim(), description: subDesc.trim() || undefined, is_active: true });
        toast.success("Complaint sub-category created successfully");
      }
      setSubDialog(null);
    } catch {
      toast.error("Unable to save complaint sub-category");
    }
  };

  const columns: Column<ComplaintCategory>[] = [
    { key: "name", header: "Category", cell: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.description || "—"}</p></div> },
    { key: "icon", header: "Icon", cell: (row) => row.icon_url ? <img src={row.icon_url} alt="" className="h-10 w-10 rounded object-cover" /> : "—" },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.is_active ? "Active" : "Inactive"} /> },
    { key: "created", header: "Created On", cell: (row) => formatDateTime(row.created_at) },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <ActionMenu
          onEdit={() => openEditCategory(row)}
          extraItems={[
            {
              label: row.is_active ? "Mark Inactive" : "Mark Active",
              onClick: async () => {
                try {
                  await updateCategoryStatus.mutateAsync({ id: row.id, isActive: !row.is_active });
                  toast.success("Category status updated");
                } catch {
                  toast.error("Unable to update category status");
                }
              },
            },
          ]}
        />
      ),
    },
  ];

  const subColumns: Column<ComplaintSubCategory>[] = [
    { key: "name", header: "Sub-category", cell: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.description || "—"}</p></div> },
    { key: "category", header: "Parent Category", cell: (row) => row.category_name },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.is_active ? "Active" : "Inactive"} /> },
    { key: "created", header: "Created On", cell: (row) => formatDateTime(row.created_at) },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <ActionMenu
          onEdit={() => openEditSubCategory(row)}
          extraItems={[
            {
              label: row.is_active ? "Mark Inactive" : "Mark Active",
              onClick: async () => {
                try {
                  await updateSubCategoryStatus.mutateAsync({ id: row.id, isActive: !row.is_active });
                  toast.success("Sub-category status updated");
                } catch {
                  toast.error("Unable to update sub-category status");
                }
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <AdminListPage
        title="Complaint Categories"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Complaints", to: ROUTES.COMPLAINTS }, { label: "Categories" }]}
        stats={[{ title: "Total Categories", value: rows.length, icon: Tags, variant: "blue" }]}
        actions={
          <div className="flex gap-2">
            <Button onClick={openAddCategory}><Plus className="mr-2 h-4 w-4" />Add Category</Button>
            <Button variant="outline" onClick={openAddSubCategory}><Plus className="mr-2 h-4 w-4" />Add Sub-category</Button>
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

      <div className="mt-6 rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <p className="text-sm font-semibold">Sub-categories</p>
        </div>
        <DataTable
          columns={subColumns}
          data={subRows}
          rowKey={(row) => String(row.id)}
          loading={subCategoriesQuery.isLoading}
          emptyTitle="No sub-categories found"
          emptyDescription="Add a sub-category under one of the categories above."
        />
      </div>

      <ConfirmDialog
        open={Boolean(categoryDialog)}
        onOpenChange={(open) => !open && setCategoryDialog(null)}
        title={categoryDialog?.mode === "edit" ? "Edit Complaint Category" : "Add Complaint Category"}
        description="Fill in the details for this complaint category."
        confirmLabel={createCategory.isPending || updateCategory.isPending ? "Saving..." : "Save"}
        onConfirm={handleSaveCategory}
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
          <div className="space-y-1.5">
            <Label>Icon</Label>
            <div className="space-y-2">
              {catIconPreview && (
                <div className="h-16 w-16 rounded-md overflow-hidden border bg-muted">
                  <img src={catIconPreview} alt="Icon Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <label className="flex h-16 cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed bg-background text-sm transition hover:border-primary/70 hover:bg-primary/5">
                <Input type="file" accept="image/*" className="sr-only" onChange={(e) => handleUploadIcon(e.target.files?.[0] ?? null)} />
                <ImageIcon className="h-5 w-5" />
                <span>{uploadIconMutation.isPending ? "Uploading..." : "Choose icon image"}</span>
              </label>
            </div>
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(subDialog)}
        onOpenChange={(open) => !open && setSubDialog(null)}
        title={subDialog?.mode === "edit" ? "Edit Complaint Sub-category" : "Add Complaint Sub-category"}
        description="Select a parent category and configure the sub-category."
        confirmLabel={createSubCategory.isPending || updateSubCategory.isPending ? "Saving..." : "Save"}
        onConfirm={handleSaveSubCategory}
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label>Parent Category *</Label>
            <Select value={subParentId} onValueChange={setSubParentId} disabled={subDialog?.mode === "edit"}>
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
