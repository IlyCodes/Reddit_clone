import { useState, useRef } from "react";
import { Feed } from "../components/Feed";

const HomePage = () => {
  const [feedType, setFeedType] = useState<"recent" | "trending">("recent");
  

  const handleButtonClick = (type: "recent" | "trending") => {
    setFeedType(type);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };
  
  return (
    <div className="content-container">
      <div className="feed-controls">
        <button 
          className={`feed-button ${feedType === "recent" ? "active" : ""}`} 
          onClick={() => handleButtonClick("recent")}
        >
          All
        </button>
        <button 
          className={`feed-button ${feedType === "trending" ? "active" : ""}`} 
          onClick={() => handleButtonClick("trending")}
        >
          Trending
        </button>
      </div>
      
      <Feed feedType={feedType} limit={10} />
    </div>
  );
};

export default HomePage;