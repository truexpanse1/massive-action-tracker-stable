import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { getRecommendedBooks, getBookReview, searchBooksByAuthor } from '../services/geminiService';

const BookListItem: React.FC<{
    book: Book;
    index: number;
    expandedBook: string | null;
    reviews: Record<string, { content: string, isLoading: boolean }>;
    onToggleReview: (title: string, author: string) => void;
}> = ({ book, index, expandedBook, reviews, onToggleReview }) => (
     <li className="border-b border-dashed border-brand-light-border dark:border-brand-gray pb-3 last:border-b-0 last:pb-0">
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-brand-blue text-white flex items-center justify-center rounded-full font-black text-xl">
                {index + 1}
            </div>
            <div className="flex-grow">
                <button onClick={() => onToggleReview(book.title, book.author)} className="text-left w-full">
                    <p className="font-bold text-brand-light-text dark:text-white hover:text-brand-blue">{book.title}</p>
                </button>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">by {book.author}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{book.description}</p>
                <div className="mt-2 flex items-center gap-3">
                    <a href={book.amazonLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-500 hover:underline">Amazon</a>
                    <a href={book.ibooksLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-500 hover:underline">Apple Books</a>
                </div>
            </div>
        </div>
        {expandedBook === book.title && (
            <div className="mt-3 ml-14 p-3 bg-brand-light-bg dark:bg-brand-gray/50 rounded-md">
                {reviews[book.title]?.isLoading ? (
                    <p className="text-xs text-center text-gray-500">Generating review...</p>
                ) : (
                    <p className="text-xs text-gray-600 dark:text-gray-300 italic">{reviews[book.title]?.content}</p>
                )}
            </div>
        )}
    </li>
)


const BookRecommendationsCard: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reviews, setReviews] = useState<Record<string, { content: string, isLoading: boolean }>>({});
    const [expandedBook, setExpandedBook] = useState<string | null>(null);
    
    // State for search
    const [searchAuthor, setSearchAuthor] = useState('');
    const [searchResults, setSearchResults] = useState<Book[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);


    useEffect(() => {
        const fetchBooks = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedBooks = await getRecommendedBooks();
                if (fetchedBooks.length > 0) {
                    setBooks(fetchedBooks);
                } else {
                    setError("Could not load book recommendations. Please refresh the page.");
                }
            } catch (err) {
                setError("An error occurred while fetching books.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBooks();
    }, []);

    const handleToggleReview = async (title: string, author: string) => {
        if (expandedBook === title) {
            setExpandedBook(null); // Collapse if already open
            return;
        }

        setExpandedBook(title);

        // Fetch review if not already fetched
        if (!reviews[title]) {
            setReviews(prev => ({ ...prev, [title]: { content: '', isLoading: true } }));
            try {
                const reviewContent = await getBookReview(title, author);
                setReviews(prev => ({ ...prev, [title]: { content: reviewContent, isLoading: false } }));
            } catch {
                setReviews(prev => ({ ...prev, [title]: { content: 'Could not load review.', isLoading: false } }));
            }
        }
    };
    
    const handleSearch = async () => {
        if (!searchAuthor.trim()) return;
        
        setIsSearching(true);
        setSearchError(null);
        setSearchResults([]);
        try {
            const results = await searchBooksByAuthor(searchAuthor);
            if (results.length === 0) {
                setSearchError(`No books found for "${searchAuthor}".`);
            }
            setSearchResults(results);
        } catch (err) {
            setSearchError("An error occurred during the search.");
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h2 className="text-xl font-bold text-center mb-4 text-brand-light-text dark:text-white uppercase">AI-Curated Reading List</h2>
            {isLoading && <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-blue"></div></div>}
            {error && !isLoading && <div className="text-center text-red-500 p-8">{error}</div>}
            {!isLoading && !error && (
                <ul className="space-y-4">
                    {books.map((book, index) => (
                        <BookListItem 
                            key={`rec-${book.title}`} 
                            book={book} 
                            index={index} 
                            expandedBook={expandedBook} 
                            reviews={reviews} 
                            onToggleReview={handleToggleReview}
                        />
                    ))}
                </ul>
            )}
            
            {/* Search Section */}
            <div className="border-t border-brand-light-border dark:border-brand-gray mt-6 pt-4">
                <h3 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-2">Search for Books by Author</h3>
                <div className="flex items-center gap-2">
                     <input
                        type="text"
                        value={searchAuthor}
                        onChange={e => setSearchAuthor(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="e.g., Stephen Covey"
                        className="flex-grow bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid"
                    />
                    <button onClick={handleSearch} disabled={isSearching} className="text-sm bg-brand-blue text-white font-bold py-1 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-brand-gray">
                        {isSearching ? '...' : 'Search'}
                    </button>
                </div>
            </div>

            {/* Search Results */}
            <div className="mt-4">
                {isSearching && <div className="text-center text-sm text-gray-500">Searching...</div>}
                {searchError && !isSearching && <div className="text-center text-sm text-red-500">{searchError}</div>}
                {!isSearching && searchResults.length > 0 && (
                    <div>
                        <h4 className="font-bold text-center mb-3 text-brand-light-text dark:text-white">Search Results for "{searchAuthor}"</h4>
                        <ul className="space-y-4">
                            {searchResults.map((book, index) => (
                                <BookListItem 
                                    key={`search-${book.title}`} 
                                    book={book} 
                                    index={index} 
                                    expandedBook={expandedBook} 
                                    reviews={reviews} 
                                    onToggleReview={handleToggleReview}
                                />
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookRecommendationsCard;