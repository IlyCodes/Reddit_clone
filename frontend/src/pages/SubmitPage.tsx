import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/SubmitPage.css";
import { FaImage } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { postService , subredditService } from "../services/api";
import { useAuth } from "../contexts/AuthContext"; 

const SubmitPage = () => {
  const { subredditName } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth(); 

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!isAuthenticated || !currentUser) {
      alert("You must be logged in to submit a post");
      navigate("/login");
      return;
    }
    if (!subredditName) {
      alert("Invalid subreddit!");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // get  subreddit
      const subreddit = await subredditService.getSubredditByName(subredditName);
      if (!subreddit) {
        alert("Subreddit not found!");
        setIsSubmitting(false);
        return;
      }
  
      // Create and populate form data
      const formData = new FormData();
      formData.append("subject", title.trim());
      formData.append("body", body.trim() || "");
      formData.append("subreddit", subreddit._id);
      formData.append("author", currentUser._id);
  
      if (selectedImage) {
        formData.append("image", selectedImage);
      }
  
      console.log("Sending FormData:");
      const entries = Array.from(formData.entries());
      for (const [key, value] of entries) {
        console.log(key, value);
      }
  
      // Send the post request
      await postService.createPost(formData); 
      navigate(`/r/${subredditName}`);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post.");
    } finally {
      setIsSubmitting(false);
    }
  };
  // console.log("Subreddit Name:", subredditName);
  // console.log("title:", title);
  // console.log("body:", body);
  // console.log("Current User:", currentUser._id);

  return (
    <div className="content-container">
      <div className="submit-container">
        <h1>Create a post in r/{subredditName}</h1>
        <form className="submit-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="submit-title"
            maxLength={100}
          />
          <div className="media-input-container">
            <label className="image-upload-label">
              <FaImage className="image-icon" />
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: "none" }}
              />
            </label>
            {imagePreview && (
              <div className="image-preview-container">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="image-preview"
                />
                <button
                  type="button"
                  className="remove-image-button"
                  onClick={handleRemoveImage}
                >
                  <IoMdClose />
                </button>
              </div>
            )}
          </div>
          <textarea
            placeholder="Text (optional)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="submit-body"
          />
          <div className="submit-actions">
            <button
              type="button"
              onClick={() => navigate(`/r/${subredditName}`)}
              className="back-button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitPage;