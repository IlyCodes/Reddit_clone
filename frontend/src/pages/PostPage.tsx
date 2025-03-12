import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import { FaArrowLeft } from "react-icons/fa";
import "../styles/PostPage.css";

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        
        const response = await fetch(`/posts/${postId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) return <div className="post-page loading"><div className="container">Loading...</div></div>;
  if (!post) return <div className="post-page not-found"><div className="container">Post not found</div></div>;

  return (
    <div className="post-page">
      <div className="container">
        <div className="page-header">
          <div onClick={() => navigate(-1)} className="back-link" style={{ cursor: "pointer" }}>
            <FaArrowLeft /> Back
          </div>
        </div>
        <PostCard post={post} showSubreddit={true} expandedView={true} />
      </div>
    </div>
  );
};

export default PostPage;