import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import "../styles/Feed.css";
import { commentService } from "../services/api";
import { useAuth } from "../contexts/AuthContext"; 

interface Post {
  _id: string;
  subject: string;
  body: string;
  _creationTime?: number;
  createdAt: string;
  author?: {
    username: string;
    _id?: string; 
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
    _creationTime?: number;
    createdAt?: string;
  }>;
  commentCount?: number;
  score?: number;
  upvotes?: number;
  downvotes?: number;
}

interface FeedProps {
  feedType?: "recent" | "trending";
  limit?: number;
}

export function Feed({ feedType = "recent", limit = 10 }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth(); 

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        
        const endpoint = feedType === "trending" 
          ? `/topposts/top?limit=${limit}` 
          : "/posts";

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${feedType} posts`);
        }
        const data = await response.json();

        
        const formattedData = await Promise.all(
          data.map(async (post: any) => {
            
            let comments = post.comments || [];
            if (!post.comments) {
              try {
                comments = await commentService.getPostComments(post._id);
              } catch (err) {
                console.error(`Error fetching comments for post ${post._id}:`, err);
              }
            }

            return {
              ...post,
              createdAt: post.createdAt || new Date(post._creationTime).toISOString(),
              comments: comments,
              commentCount: comments.length,
            };
          })
        );

        setPosts(formattedData);
      } catch (error) {
        console.error(`Error fetching ${feedType} posts:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [feedType, limit]);

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    try {
      await fetch(`/posts/${postId}`, {
        method: "DELETE",
      });

      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const title = feedType === "trending" ? "Trending Today" : "All Posts";

  if (loading) {
    return (
      <div className="content-grid">
        <div className="feed-container">
          <h2 className="section-title">{title}</h2>
          <p>Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-grid">
      <div className="feed-container">
        <h2 className="section-title">{title}</h2>
        {posts.length === 0 ? (
          <p>No posts available</p>
        ) : (
          <div className="posts-list">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                showSubreddit={true}
                onDelete={() => handleDeletePost(post._id)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;