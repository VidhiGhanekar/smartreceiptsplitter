import React from 'react';
import { motion } from 'framer-motion';
import { PersonSummary } from '@/types/bill';
import { formatCurrency, getPersonBg, getPersonBgLight, getPersonText, getPersonBorder } from '@/lib/bill-utils';
import { Receipt, Users } from 'lucide-react';

interface SplitSummaryProps {
  summaries: PersonSummary[];
  grandTotal: number;
}

const SplitSummary: React.FC<SplitSummaryProps> = ({ summaries, grandTotal }) => {
  if (summaries.length === 0) return null;

  const assignedTotal = summaries.reduce((s, sm) => s + sm.total, 0);

  return (
    <div className="space-y-4">
      <h2 className="section-title flex items-center gap-2">
        <Receipt className="w-5 h-5 text-primary" />
        Summary
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {summaries.map((summary, idx) => (
          <motion.div
            key={summary.person.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`summary-card border ${getPersonBorder(summary.person.colorIndex)}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-3.5 h-3.5 rounded-full ${getPersonBg(summary.person.colorIndex)}`} />
              <span className="font-semibold font-display">{summary.person.name}</span>
              <span className={`ml-auto text-lg font-bold tabular-nums ${getPersonText(summary.person.colorIndex)}`}>
                {formatCurrency(summary.total)}
              </span>
            </div>

            {summary.individualItems.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Individual items</p>
                {summary.individualItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="truncate">{item.name}</span>
                    <span className="font-medium tabular-nums">{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
            )}

            {summary.sharedItems.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Shared items
                </p>
                {summary.sharedItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="truncate text-muted-foreground">
                      {item.name}
                      <span className="text-xs ml-1">({formatCurrency(item.fullPrice)})</span>
                    </span>
                    <span className="font-medium tabular-nums">{formatCurrency(item.share)}</span>
                  </div>
                ))}
              </div>
            )}

            {summary.total === 0 && (
              <p className="text-xs text-muted-foreground">No items assigned yet</p>
            )}
          </motion.div>
        ))}
      </div>

      {grandTotal > 0 && (
        <div className="flex justify-between items-center px-4 py-3 bg-primary/10 rounded-xl">
          <span className="font-semibold">Grand Total</span>
          <span className="text-xl font-bold font-display text-primary tabular-nums">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      )}

      {grandTotal > 0 && Math.abs(assignedTotal - grandTotal) > 0.01 && (
        <p className="text-xs text-muted-foreground text-center">
          {formatCurrency(grandTotal - assignedTotal)} still unassigned
        </p>
      )}
    </div>
  );
};

export default SplitSummary;
