
import React from 'react';
import { LibraryStats } from '../types.ts';

interface Props {
  stats: LibraryStats;
}

const StatsCards: React.FC<Props> = ({ stats }) => {
  const cards = [
    { label: 'Total Books', value: stats.totalBooks, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Available', value: stats.availableBooks, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'On Loan', value: stats.borrowedBooks, color: 'bg-amber-50 text-amber-700' },
    { label: 'Categories', value: stats.categoriesCount, color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.label} className={`p-4 rounded-2xl ${card.color} border border-white/50 shadow-sm transition-transform hover:scale-[1.02]`}>
          <p className="text-xs font-medium uppercase tracking-wider opacity-70 mb-1">{card.label}</p>
          <p className="text-2xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
