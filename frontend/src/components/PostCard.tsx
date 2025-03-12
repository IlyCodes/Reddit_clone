import { FaRegCommentAlt, FaTrash } from "react-icons/fa";
import { TbArrowBigUp, TbArrowBigDown } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Comment from "./Comment";
import "../styles/PostCard.css";
import { commentService, voteService, postService } from "../services/api";
import { useAuth } from "../contexts/AuthContext"; 

interface Post {
  _id: string;
  subject: string;
  body: string;
  _creationTime?: number;
  createdAt: string;
  author?: {
    _id?: string; 
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
      _id?: string;
      username?: string;
    };
    _creationTime?: number;
    createdAt?: string;
  }>;
  commentCount?: number;
}

interface PostCardProps {
  post: Post;
  showSubreddit?: boolean;
  expandedView?: boolean;
  onDelete?: () => void; 
}

const VoteButtons = ({ postId }: { postId: string }) => {
  const [voteCount, setVoteCount] = useState(0);
  const [userVote, setUserVote] = useState(0);
  const { currentUser } = useAuth(); 

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const data = await voteService.getPostVotes(postId);
        console.log("Fetched Votes:", data);
        setVoteCount(data.totalVotes);
        setUserVote(data.userVote || 0);
      } catch (err) {
        console.error("Failed to fetch votes:", err);
      }
    };

    fetchVotes();
  }, [postId]);

  const handleVote = async (value: number) => {
    if (!currentUser) {
      alert("You must be logged in to vote");
      return;
    }

    try {
      const newValue = userVote === value ? 0 : value; 
      const response = await voteService.castVote({
        post: postId,
        value: newValue,
      });

      console.log("Vote Response:", response); 
      setVoteCount(response.totalVotes);
      setUserVote(response.userVote);
    } catch (error) {
      console.error("Error voting:", error);
      alert("There was an error casting your vote. Please try again.");
    }
  };

  return (
    <div className="vote-section">
      <button
        className={`vote-button ${userVote === 1 ? "voted" : ""}`}
        onClick={() => handleVote(1)} 
        disabled={!currentUser} 
      >
        <TbArrowBigUp size={24} />
      </button>
      <span className="vote-count">{voteCount}</span>
      <button
        className={`vote-button ${userVote === -1 ? "voted downvoted" : ""}`}
        onClick={() => handleVote(-1)} 
        disabled={!currentUser} 
      >
        <TbArrowBigDown size={24} />
      </button>
    </div>
  );
};

const PostHeader = ({
  author,
  subreddit,
  showSubreddit,
  createdAt,
}: {
  author?: { username: string };
  subreddit?: { name: string };
  showSubreddit: boolean;
  createdAt: string;
}) => {
  return (
    <div className="post-header">
      {author ? (
        <Link to={`/u/${author.username}`} className="post-author">
          u/{author.username}
        </Link>
      ) : (
        <span className="post-author">u/deleted</span>
      )}
      {showSubreddit && subreddit && (
        <>
          <span className="post-dot">-</span>
          <Link to={`/r/${subreddit.name}`} className="post-subreddit">
            r/{subreddit.name}
          </Link>
        </>
      )}
      <span className="post-dot">-</span>
      <span className="post-timestamp">
        {new Date(createdAt).toLocaleString()}
      </span>
    </div>
  );
};

const PostContent = ({
  subject,
  body,
  image,
  expandedView,
}: {
  subject: string;
  body?: string;
  image?: string;
  expandedView: boolean;
}) => {
  const hasImage = !!image; 

  return (
    <>
      {expandedView ? (
        <>
          <h1 className="post-title">{subject}</h1>
          {hasImage && (
            <div className="post-image-container">
              <img src={image} alt="Post content" className="post-image" />
            </div>
          )}
          {body && <p className="post-body">{body}</p>}
        </>
      ) : (
        <div className={`preview-post ${hasImage ? "" : "no-image"}`}>
          <div className="text-content">
            <h2 className="post-title">{subject}</h2>
            {body && <p className="post-body">{body}</p>}
          </div>
          {hasImage && (
            <div className="post-image-container small-img">
              <img src={image} alt="Post content" className="post-image" />
            </div>
          )}
        </div>
      )}
    </>
  );
};

const PostCard = ({
  post,
  showSubreddit = false,
  expandedView = false,
  onDelete,
}: PostCardProps) => {
  const [showComments, setShowComments] = useState(expandedView);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [isDeleting, setIsDeleting] = useState(false); 
  const navigate = useNavigate();
  const { currentUser } = useAuth(); 

  // Enhanced author check with debugging
  const isAuthor = () => {
    // If not logged in, never the author
    if (!currentUser) {
      console.log("Not logged in, so not author");
      return false;
    }
    
    // For debugging
    console.log("Current user:", currentUser);
    console.log("Post:", post);
    console.log("Post author:", post.author);
    
    // Check if author data exists
    if (!post.author) {
      console.log("No author data");
      return false;
    }
    
    // Check for direct ID match
    if (post.author._id && currentUser._id === post.author._id) {
      console.log("Author match by ID");
      return true;
    }
    
    // Alternatively check by username if IDs aren't available
    if (post.author.username && currentUser.username === post.author.username) {
      console.log("Author match by username");
      return true;
    }
    
    console.log("Not author");
    return false;
  };

  const handleComment = () => {
    if (!expandedView) {
      navigate(`/post/${post._id}`);
    } else {
      setShowComments(!showComments);
    }
  };

  useEffect(() => {
    if (expandedView) {
      fetchComments();
    }
  }, [expandedView, post._id]);

  const fetchComments = async () => {
    try {
      const data = await commentService.getPostComments(post._id);
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      try {
        await commentService.createComment(post._id, {
          content: newComment,
          author: currentUser?._id, 
        });

        await fetchComments();
        setNewComment("");
      } catch (error) {
        console.error("Failed to submit comment:", error);
      }
    }
  };

  const handleDeletePost = async () => {
    if (!isAuthor() || isDeleting) return; 

    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        setIsDeleting(true);
        await postService.deletePost(post._id); 

        if (onDelete) {
          onDelete(); 
        } else {
          navigate("/"); 
        }
      } catch (error) {
        console.error("Failed to delete post:", error);
        alert("Failed to delete post. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`post-card ${expandedView ? "expanded" : ""}`}>
      <VoteButtons postId={post._id} />
      <div className="post-content">
        <PostHeader
          author={post.author}
          subreddit={post.subreddit}
          showSubreddit={showSubreddit}
          createdAt={post.createdAt}
        />
        <PostContent
          subject={post.subject}
          body={post.body}
          image={post.imageUrl}
          expandedView={expandedView}
        />
        <div className="post-actions">
          <button className="action-button" onClick={handleComment}>
            <FaRegCommentAlt />
            <span>{post.commentCount ?? comments.length} Comments</span>
          </button>

          {/* Updated to use the isAuthor function */}
          {isAuthor() && (
            <button
              className="action-button delete-button"
              onClick={handleDeletePost}
              disabled={isDeleting}
            >
              <FaTrash />
              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            </button>
          )}
        </div>

        {/* Render comments section if showComments is true */}
        {showComments && (
          <div className="comments-section">
            {/* Comment Input Area */}
            <form onSubmit={handleSubmitComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="comment-input"
              />
              <button type="submit" className="comment-submit">
                Submit
              </button>
            </form>

            {/* Display Existing Comments */}
            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <Comment 
                    key={comment._id} 
                    comment={comment} 
                    onDelete={fetchComments}
                  />
                ))
              ) : (
                <p>No comments yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;