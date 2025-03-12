import { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { searchService } from "../services/api";
import "../styles/SearchBar.css";

interface SearchResult {
  _id: string;
  type: string;
  title: string;
  name: string;
}

const SearchBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  
  const subredditMatch = location.pathname.match(/^\/r\/([^/]+)/);
  const currentSubreddit = subredditMatch ? subredditMatch[1] : null;

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch(searchQuery);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentSubreddit]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // Use search service
      const data = await searchService.search(query, currentSubreddit || undefined);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocus = () => {
    setIsActive(true);
    if (searchQuery.length >= 2) {
      performSearch(searchQuery);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsActive(true);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "post") {
      navigate(`/post/${result._id}`);
    } else if (result.type === "community") {
      navigate(`/r/${result.name}`);
    }
    setIsActive(false);
    setSearchQuery("");
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "community":
        return "🌐";
      case "post":
        return "📝";
      default:
        return "•";
    }
  };

  return (
    <div className="search-wrapper" ref={searchRef}>
      <div className="search-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={
            currentSubreddit
              ? `Search r/${currentSubreddit}`
              : "Search for a community or post"
          }
          value={searchQuery}
          onChange={handleSearch}
          onFocus={handleFocus}
        />
        {currentSubreddit && (
          <div className="search-scope">
            <span>in r/{currentSubreddit}</span>
          </div>
        )}
      </div>
      
      {isActive && (
        <div className="search-results">
          {isLoading ? (
            <div className="empty-state">
              <p>Loading...</p>
            </div>
          ) : searchQuery === "" ? (
            <div className="empty-state">
              <p>Try searching for posts or communities.</p>
            </div>
          ) : results && results.length > 0 ? (
            <ul className="results-list">
              {results.map((result) => (
                <li
                  key={`${result.type}-${result._id}`}
                  className="result-item"
                  onClick={() => handleResultClick(result)}
                >
                  <span className="result-icon">
                    {getIconForType(result.type)}
                  </span>
                  <div className="result-container">
                    <span className="result-title">{result.title}</span>
                    {result.type === "post" && (
                      <span className="result-subreddit">in r/{result.name}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <p>No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;