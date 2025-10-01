// src/app/(protected)/dashboard/ui/BalanceCard.tsx
type Props = {
  balance: number;
  goal?: number | null;
  totalContrib?: number | null;
};

export default function BalanceCard({ balance, goal, totalContrib }: Props) {
  const g = typeof goal === "number" && goal > 0 ? goal : null;
  const pct = g ? Math.min(100, Math.round((balance / g) * 100)) : null;

  return (
    <div className="card bg-base-100 border shadow-sm">
      <div className="card-body gap-3 md:gap-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="card-title text-green-700 text-lg md:text-xl">Savings</h3>
          <span className="badge badge-success text-[10px] md:text-xs">Active</span>
        </div>

        <div className="text-2xl md:text-3xl font-semibold break-words">
          ₦{Number(balance).toLocaleString()}
        </div>

        {g && (
          <div className="space-y-2">
            <progress
              className="progress progress-success w-full"
              value={pct ?? 0}
              max={100}
            />
            <div className="text-xs md:text-sm opacity-70">
              {pct}% of ₦{g.toLocaleString()} goal
            </div>
          </div>
        )}

        {typeof totalContrib === "number" && (
          <div className="text-xs md:text-sm opacity-80">
            Total contributions: ₦{totalContrib.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
