
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  status: 'Available' | 'Borrowed';
  borrower: string | null;
  description: string;
  added_date: string;
}

export interface LibraryStats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  categoriesCount: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
