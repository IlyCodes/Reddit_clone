import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import { subredditService, postService, commentService } from "../services/api"; // Import API services
import "../styles/SubredditPage.css";

interface Post {
  _id: string;
  subject: string;
  body: string;
  createdAt: string;
  author?: {
    username: string;
  };
  subreddit?: {
    name: string;
  };
  imageUrl?: string;
  comments?: Array<{
    _id: string;
    content: string;
    author?: {
      username?: string;
    };
    createdAt?: string;
  }>;
  commentCount?: number;
}

const SubredditPage = () => {
  const { subredditName } = useParams();
  const [subreddit, setSubreddit] = useState<{ _id: string; name: string; description?: string } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubredditData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch subreddit details
        const subredditData = await subredditService.getSubredditByName(subredditName as string);
        console.log("Subreddit data:", subredditData);
        setSubreddit(subredditData);

        // Fetch posts for the subreddit
        const postsData = await postService.getPostsBySubreddit(subredditData._id);
        console.log("Initial posts data:", postsData);
        
        // Fetch comment counts for each post
        const postsWithComments = await Promise.all(
          postsData.map(async (post: Post) => {
            try {
              const comments = await commentService.getPostComments(post._id);
              console.log(`Comments for post ${post._id}:`, comments);
              
              return {
                ...post,
                comments: comments,
                commentCount: comments.length
              };
            } catch (err) {
              console.error(`Error fetching comments for post ${post._id}:`, err);
              return {
                ...post,
                commentCount: 0
              };
            }
          })
        );
        
        console.log("Posts with comments:", postsWithComments);
        setPosts(postsWithComments);
      } catch (err: any) {
        console.error("Error fetching subreddit:", err);
        setError("Subreddit not found");
      } finally {
        setLoading(false);
      }
    };

    fetchSubredditData();
  }, [subredditName]);

  if (loading) return <p>Loading...</p>;

  if (error || !subreddit) {
    return (
      <div className="content-container">
        <div className="not-found">
          <h1>Subreddit not found</h1>
          <p>The subreddit r/{subredditName} does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="subreddit-banner">
        <h1>r/{subreddit.name}</h1>
        {subreddit.description && <p>{subreddit.description}</p>}
      </div>
      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet. Be the first to post</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard 
              key={post._id} 
              post={post} 
              showSubreddit={false} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SubredditPage;