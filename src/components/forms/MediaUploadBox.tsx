import { Image, Video } from "lucide-react";
import { FileUploadBox } from "@/components/forms/FileUploadBox";

export function MediaUploadBox({
  imageLabel = "Upload Image",
  videoLabel = "Upload Video",
}: {
  imageLabel?: string;
  videoLabel?: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FileUploadBox label={imageLabel} icon={Image} accept="image/*" />
      <FileUploadBox label={videoLabel} icon={Video} accept="video/*" />
    </div>
  );
}
