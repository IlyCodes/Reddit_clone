import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import { postService, userService, commentService, subredditService } from "../services/api";
import "../styles/SubmitPage.css";

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
    _id?: string;
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

interface PostApiResponse {
  _id: string;
  subject: string;
  body: string;
  createdAt: string;
  author?: {
    username: string;
  };
  subreddit?: {
    _id?: string;
    name?: string;
  };
  imageUrl?: string;
}

interface Subreddit {
  _id: string;
  name: string;
}

const ProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState<{ _id: string } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [subredditMap, setSubredditMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const allSubreddits = await subredditService.getAllSubreddits();
        console.log("All subreddits:", allSubreddits);

        const subredditLookup: Record<string, string> = {};
        allSubreddits.forEach((sub: Subreddit) => {
          subredditLookup[sub._id] = sub.name;
        });
        setSubredditMap(subredditLookup);
        console.log("Subreddit Map:", subredditLookup);

        // Fetch user data
        const userData = await userService.getUserByName(username as string);
        console.log("User data:", userData);
        setUser(userData);

        // Fetch posts made by the user
        const postsData = await postService.getPostsByUser(userData._id);
        console.log("Initial posts data:", postsData);

        // Enhance posts with subreddit names
        const enhancedPosts = await Promise.all(
          postsData.map(async (post: PostApiResponse) => {
            let subredditInfo: { _id?: string; name: string } = { name: "Unknown Subreddit" };
        
            if (typeof post.subreddit === "string") {
              try {
                const subredditData = await subredditService.getSubredditById(post.subreddit);
                if (subredditData) {
                  subredditInfo = { _id: subredditData._id, name: subredditData.name };
                }
              } catch (err) {
                console.error(`Error fetching subreddit ${post.subreddit}:`, err);
              }
            } else if (post.subreddit?._id) {
              subredditInfo = {
                _id: post.subreddit._id,
                name: post.subreddit.name || "Unknown Subreddit",
              };
            }
        
            console.log(`Post ${post._id} mapped to subreddit:`, subredditInfo);
        
            // Fetch comments
            const comments = await commentService.getPostComments(post._id);
        
            return {
              ...post,
              subreddit: subredditInfo,
              comments: comments,
              commentCount: comments.length,
            };
          })
        );
        

        console.log("Enhanced posts:", enhancedPosts);
        setPosts(enhancedPosts);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  return (
    <div className="content-container">
      <div className="profile-header">
        <h1>u/{username}</h1>
        <p style={{ color: "#7c7c7c" }}>Posts: {posts.length}</p>
      </div>

      {loading ? (
        <div className="loading">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="no-posts"><p>No posts yet</p></div>
      ) : (
        <div className="posts-container">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} showSubreddit={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
