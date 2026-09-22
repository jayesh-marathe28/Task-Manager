import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading workspace..." }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
        <LoaderCircle className="size-5 animate-spin text-blue-600" />
        <span>{label}</span>
      </div>
    </div>
  );
}
