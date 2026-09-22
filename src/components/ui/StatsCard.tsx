import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function StatsCard({
  label,
  value,
  detail,
  icon,
  onClick,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <Card className={`relative flex min-h-[172px] flex-col overflow-hidden p-5 ${onClick ? "transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md" : ""}`}>
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">{icon}</div>
        <ArrowRight className="size-4 text-slate-500" />
      </div>
      <p className="mt-8 text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </Card>
  );

  return onClick ? (
    <button type="button" className="block w-full text-left" onClick={onClick} aria-label={`View ${label}`}>
      {content}
    </button>
  ) : content;
}
