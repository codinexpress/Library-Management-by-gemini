
import React, { useState, useEffect, useCallback } from 'react';
import { initDatabase, getBooks, addBook, updateBookStatus, deleteBook, connectToFile, createNewFile, isFileSystemSupported } from './db/database.ts';
import { Book, LibraryStats } from './types.ts';
import BookList from './components/BookList.tsx';
import StatsCards from './components/StatsCards.tsx';
import LibrarianChat from './components/LibrarianChat.tsx';

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState<{ id: number; isOpen: boolean } | null>(null);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', category: '', description: '' });
  const [borrowerName, setBorrowerName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const loadData = useCallback(() => {
    const data = getBooks();
    setBooks(data);
  }, []);

  useEffect(() => {
    initDatabase().then(() => {
      setIsDbReady(true);
      loadData();
    });
  }, [loadData]);

  const handleConnect = async () => {
    const success = await connectToFile();
    if (success) {
      setIsConnected(true);
      loadData();
    }
  };

  const handleCreate = async () => {
    const success = await createNewFile();
    if (success) {
      setIsConnected(true);
      loadData();
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;
    await addBook(newBook);
    setNewBook({ title: '', author: '', isbn: '', category: '', description: '' });
    setShowAddModal(false);
    loadData();
  };

  const handleDeleteBook = async (id: number) => {
    if (window.confirm('Remove this book from your library?')) {
      await deleteBook(id);
      loadData();
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    if (currentStatus === 'Available') {
      setShowBorrowModal({ id, isOpen: true });
    } else {
      await updateBookStatus(id, 'Available', null);
      loadData();
    }
  };

  const handleConfirmBorrow = async () => {
    if (showBorrowModal && borrowerName) {
      await updateBookStatus(showBorrowModal.id, 'Borrowed', borrowerName);
      setShowBorrowModal(null);
      setBorrowerName('');
      loadData();
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats: LibraryStats = {
    totalBooks: books.length,
    availableBooks: books.filter(b => b.status === 'Available').length,
    borrowedBooks: books.filter(b => b.status === 'Borrowed').length,
    categoriesCount: new Set(books.map(b => b.category)).size,
  };

  if (!isDbReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">Initializing library engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 hidden md:block">Lumina Library Pro</h1>
          </div>
          
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search collection..." 
                className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isConnected && isFileSystemSupported() && (
              <div className="flex gap-2">
                <button 
                  onClick={handleConnect}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 012 2v3a2 2 0 01-2 2H5z" /></svg>
                  Connect Database
                </button>
                <button 
                  onClick={handleCreate}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 transition-all"
                >
                  New DB
                </button>
              </div>
            )}
            {isConnected && (
              <span className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Connected
              </span>
            )}
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!isConnected && isFileSystemSupported() && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-4">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h4 className="text-amber-900 font-bold text-sm">Local-First Storage</h4>
              <p className="text-amber-800/80 text-xs mt-1">Changes are currently stored in-memory. Connect to a local SQLite file to persist your data across sessions using the File System Access API.</p>
            </div>
          </div>
        )}

        <StatsCards stats={stats} />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Collection Inventory</h2>
          <div className="flex gap-2 text-sm">
             {/* Add sorting/filtering triggers here if needed */}
          </div>
        </div>

        <BookList 
          books={filteredBooks} 
          onToggleStatus={handleToggleStatus} 
          onDelete={handleDeleteBook} 
        />
      </main>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Add New Book</h3>
              <form onSubmit={handleAddBook} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Title *</label>
                    <input 
                      required
                      className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                      value={newBook.title}
                      onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                      placeholder="e.g. The Great Gatsby"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Author *</label>
                    <input 
                      required
                      className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                      value={newBook.author}
                      onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                      placeholder="e.g. F. Scott Fitzgerald"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ISBN</label>
                    <input 
                      className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                      value={newBook.isbn}
                      onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                      placeholder="978-0123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Genre/Category</label>
                    <input 
                      className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                      value={newBook.category}
                      onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                      placeholder="e.g. Classic"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                  <textarea 
                    className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                    value={newBook.description}
                    onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                    placeholder="Short summary of the book..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                  >
                    Save Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showBorrowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Check Out Book</h3>
            <p className="text-slate-500 text-sm mb-6">Who is borrowing this book?</p>
            <input 
              autoFocus
              className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 mb-6"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              placeholder="Borrower's Name"
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmBorrow()}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowBorrowModal(null)}
                className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmBorrow}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <LibrarianChat inventory={books} />
    </div>
  );
};

export default App;
