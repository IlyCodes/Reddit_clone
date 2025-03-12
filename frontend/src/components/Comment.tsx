import { useState } from "react";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth
import { commentService } from "../services/api";
import "../styles/Comment.css";

interface CommentProps {
  comment: {
    _id: string;
    content: string;
    author?: {
      _id?: string;
      username?: string;
    };
    createdAt?: string;
  };
  onDelete?: () => void; 
}

const Comment = ({ comment, onDelete }: CommentProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentUser } = useAuth(); 
  const isAuthor = currentUser?._id === comment.author?._id;

  const handleDeleteComment = async () => {
    if (!isAuthor || isDeleting) return;

    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        setIsDeleting(true);
        await commentService.deleteComment(comment._id);

        // Call the onDelete callback to refresh the comments list
        if (onDelete) {
          onDelete();
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        alert("Failed to delete comment. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="comment">
      <div className="comment-header">
        {comment.author?.username ? (
          <Link to={`/u/${comment.author.username}`} className="comment-author">
            u/{comment.author.username}
          </Link>
        ) : (
          <span className="comment-author">deleted</span>
        )}
        <span className="comment-dot">-</span>
        <span className="comment-timestamp">
          {comment.createdAt
            ? new Date(comment.createdAt).toLocaleString()
            : "Unknown"}
        </span>

        {/* Show delete button only if the current user is the author */}
        {isAuthor && (
          <button
            className="comment-delete-button"
            onClick={handleDeleteComment}
            disabled={isDeleting}
            aria-label="Delete comment"
          >
            <FaTrash size={12} />
          </button>
        )}
      </div>
      <div className="comment-content">{comment.content}</div>
    </div>
  );
};

export default Comment;