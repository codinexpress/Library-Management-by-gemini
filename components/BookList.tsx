
import React from 'react';
import { Book } from '../types.ts';

interface Props {
  books: Book[];
  onToggleStatus: (id: number, currentStatus: string) => void;
  onDelete: (id: number) => void;
}

const BookList: React.FC<Props> = ({ books, onToggleStatus, onDelete }) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Your library is empty</h3>
        <p className="text-slate-500 mt-2">Start adding books to build your collection.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <div key={book.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative group">
          <div className="flex justify-between items-start mb-3">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${book.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {book.status}
            </span>
            <button 
              onClick={() => onDelete(book.id)}
              className="text-slate-300 hover:text-red-500 transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{book.title}</h3>
          <p className="text-slate-600 text-sm mb-4 font-medium">by {book.author}</p>
          
          <div className="space-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400 w-12">ISBN:</span>
              <span>{book.isbn || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400 w-12">Genre:</span>
              <span>{book.category || 'Uncategorized'}</span>
            </div>
            {book.borrower && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 text-amber-700 rounded-lg">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
                <span>Borrowed by: <strong>{book.borrower}</strong></span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
            <button 
              onClick={() => onToggleStatus(book.id, book.status)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                book.status === 'Available' 
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {book.status === 'Available' ? 'Check Out' : 'Return Book'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookList;
