/**
 * BudgetTracker Component
 * Shows a running budget indicator: spent vs. remaining.
 * Displays a progress bar with color coding based on spend percentage.
 */

interface BudgetTrackerProps {
  totalBudget: number;
  spent: number;
}

export default function BudgetTracker({ totalBudget, spent }: BudgetTrackerProps) {
  const remaining = Math.max(0, totalBudget - spent);
  const percentage = totalBudget > 0 ? Math.min((spent / totalBudget) * 100, 100) : 0;

  // Color coding: green < 60%, yellow 60-85%, red > 85%
  const barColor =
    percentage > 85
      ? 'bg-red-500'
      : percentage > 60
      ? 'bg-yellow-500'
      : 'bg-emerald-500';

  const statusColor =
    percentage > 85
      ? 'text-red-600'
      : percentage > 60
      ? 'text-yellow-600'
      : 'text-emerald-600';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm" role="region" aria-label="Budget tracker">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">💰 Budget Tracker</h3>
        <span className={`text-sm font-bold ${statusColor}`}>
          ${remaining.toFixed(0)} remaining
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Budget usage: ${Math.round(percentage)}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>Spent: ${spent.toFixed(0)}</span>
        <span>Total: ${totalBudget.toFixed(0)}</span>
      </div>
    </div>
  );
}
