'use client';

interface StatsItem {
  label: string;
  count: number;
}

interface StatsCardProps {
  title: string;
  items: StatsItem[];
  total?: number;
}

export function StatsCard({ title, items, total }: StatsCardProps) {
  return (
    <div className="mt-6 space-y-2 p-4 rounded-lg bg-ind-panel border border-ind-border/50">
      <h3 className="text-xs font-semibold text-ind-text-muted uppercase">{title}</h3>
      <div className="space-y-1">
        {total !== undefined && (
          <p className="text-sm text-ind-text">
            Total: <span className="font-semibold text-ind-accent">{total}</span>
          </p>
        )}
        {items.map((item) => (
          <p key={item.label} className="text-xs text-ind-text-muted">
            {item.label}: <span className="text-ind-text font-medium">{item.count}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export default StatsCard;
