import DropzoneBox from "./DropzoneBox";
import type { UploadedDoc } from "../types";

interface UploadBoxProps {
  onDocLoaded?: (doc: UploadedDoc) => void;
}

export default function UploadBox({ onDocLoaded }: UploadBoxProps) {
  return (
    <DropzoneBox
      onDocLoaded={onDocLoaded || (() => {})}
      recentDocs={[]}
      onShowToast={(type, msg) => console.log(type, msg)}
    />
  );
}
