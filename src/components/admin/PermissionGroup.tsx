import { Checkbox } from "@/components/ui/checkbox";
import { SectionCard } from "@/components/admin/SectionCard";

export function PermissionGroup({
  title,
  permissions,
}: {
  title: string;
  permissions: string[];
}) {
  return (
    <SectionCard title={title} className="p-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {permissions.map((permission) => (
          <label key={permission} className="flex items-center gap-2 text-sm">
            <Checkbox defaultChecked={permission !== "Delete"} />
            {permission}
          </label>
        ))}
      </div>
    </SectionCard>
  );
}
