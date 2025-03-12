import { useState } from "react";
import { useAuth } from "../contexts/AuthContext"; 
import "../styles/CreateCommunityModal.css";
import { subredditService } from "../services/api";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCommunityModal = ({ isOpen, onClose }: CreateCommunityModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { currentUser } = useAuth(); 

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!name) {
      setError("Community name is required");
      return;
    }

    if (name.length < 3 || name.length > 21) {
      setError("Community name must be between 3 and 21 characters.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setError("Community name can only contain letters, numbers, and underscores.");
      return;
    }

    // Ensure the user is authenticated
    if (!currentUser) {
      setError("You must be logged in to create a community.");
      return;
    }

    setIsLoading(true);

    try {
      // Create the subreddit with the current user as the creator
      await subredditService.createSubreddit({
        name,
        description,
        creator: currentUser._id, 
      });

      setIsLoading(false);
      onClose(); 
    } catch (error: any) {
      setError(error.message || "Failed to create community. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-container">
        <div className="modal-header">
          <h2>Create a Community</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="/r community_name"
              maxLength={21}
              disabled={isLoading}
            />
            <p className="input-help">
              Community names (including capitalization) cannot be changed.
            </p>
          </div>
          <div className="form-group">
            <label htmlFor="description">
              Description <span>(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your community"
              maxLength={100}
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button type="submit" className="create-button" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Community"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateCommunityModal;