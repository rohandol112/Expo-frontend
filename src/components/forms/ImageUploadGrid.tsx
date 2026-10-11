import { useEffect, useId, useState } from "react";
import { ImageIcon, Plus, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Client-only image picker with preview (no upload endpoint yet — the backend
 * for these modules doesn't exist). Single mode shows one dashed box; multi
 * mode shows a grid of preview tiles plus "+" tiles up to `max`.
 */
export function ImageUploadGrid({
  label,
  hint,
  value,
  onChange,
  multiple = false,
  max = 10,
  className,
}: {
  label: string;
  hint?: string;
  value: File[];
  onChange: (files: File[]) => void;
  multiple?: boolean;
  max?: number;
  className?: string;
}) {
  const inputId = useId();
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = value.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [value]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!multiple) {
      onChange([files[0]]);
      return;
    }
    const remaining = max - value.length;
    if (remaining <= 0) return;
    onChange([...value, ...Array.from(files).slice(0, remaining)]);
  };

  const removeAt = (index: number) => onChange(value.filter((_, i) => i !== index));

  if (!multiple) {
    const preview = previews[0];
    return (
      <div className={cn("space-y-2", className)}>
        <label className="text-sm font-medium">{label}</label>
        {preview ? (
          <div className="group relative h-40 w-full max-w-sm overflow-hidden rounded-md border bg-muted">
            <img src={preview} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange([])}
              className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white shadow-md hover:bg-red-700"
              title="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <>
            <input id={inputId} type="file" accept="image/*" className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
            <label
              htmlFor={inputId}
              className="flex h-40 w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-background text-center transition hover:border-primary/70 hover:bg-primary/5"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-semibold">Upload {label}</span>
              {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
            </label>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="grid grid-cols-5 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {previews.map((src, index) => (
          <div key={index} className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white shadow-md hover:bg-red-700"
              title="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <>
            <input id={inputId} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
            <label
              htmlFor={inputId}
              className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-background text-center transition hover:border-primary/70 hover:bg-primary/5"
            >
              {value.length === 0 ? (
                <>
                  <Upload className="mb-1 h-5 w-5 text-muted-foreground" />
                  <span className="text-[11px] font-medium text-muted-foreground">Upload Images</span>
                </>
              ) : (
                <Plus className="h-5 w-5 text-muted-foreground" />
              )}
            </label>
          </>
        )}
      </div>
    </div>
  );
}

/** Small inline preview for a single already-picked icon/image, used next to upload controls. */
export function ImagePreviewThumb({ file, size = 20 }: { file: File | null; size?: number }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) { setUrl(null); return; }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  if (!url) return <ImageIcon className="h-5 w-5 text-muted-foreground" />;
  return <img src={url} alt="" className="rounded object-cover" style={{ width: size * 4, height: size * 4 }} />;
}
