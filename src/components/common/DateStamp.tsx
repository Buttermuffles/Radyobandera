import { CalendarClock } from "lucide-react";
import { formatDate } from "../../lib/utils";

interface DateStampProps {
  date: string;
}

export function DateStamp({ date }: DateStampProps) {
  return (
    <p className="inline-flex items-center gap-1 text-xs text-brand-muted">
      <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
      <time dateTime={date}>{formatDate(date)}</time>
    </p>
  );
}
