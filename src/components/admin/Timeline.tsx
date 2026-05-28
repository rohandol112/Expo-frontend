export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  time: string;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3">
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/10" />
          <div>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.description}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
