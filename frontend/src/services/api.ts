import {authService} from '../services/auth'
export const API_BASE_URL = 'http://localhost:5050';

type HeadersInit = Record<string, string>;

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'An error occurred');
  }
  return response.json();
};


const getAuthHeader = (): HeadersInit => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  console.log(getAuthHeader());

 
// Post Services
export const postService = {
  createPost: async (postData: FormData) => {
    console.log("FormData content:");
    const entries = Array.from(postData.entries());
    for (const [key, value] of entries) {
      console.log(key, value);
    }
    
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(), 
      },
      body: postData, 
    });
    return handleResponse(response);
  },
  
    getAllPosts: async () => {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        headers: getAuthHeader(), 
      });
      return handleResponse(response);
    },
  
    getPostsByUser: async (userId: string) => {
      const response = await fetch(`${API_BASE_URL}/posts/user/${userId}`, {
        headers: getAuthHeader(), 
      });
      return handleResponse(response);
    },
  
    getPostsBySubreddit: async (subredditId: string) => {
      const response = await fetch(`${API_BASE_URL}/posts/subreddit/${subredditId}`, {
        headers: getAuthHeader(), 
      });
      return handleResponse(response);
    },
  
    deletePost: async (postId: string) => {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeader(), 
      });
      return handleResponse(response);
    },
  };
  
  // Comment Services
  export const commentService = {
    createComment: async (postId: string, commentData: any) => {
      const response = await fetch(`${API_BASE_URL}/comments/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(), 
        },
        body: JSON.stringify(commentData),
      });
      return handleResponse(response);
    },
  
    getPostComments: async (postId: string) => {
      const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`, {
        headers: getAuthHeader(), 
      });
      return handleResponse(response);
    },
  
    deleteComment: async (commentId: string) => {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeader(), 
      });
      return handleResponse(response);
    },
  };
  
  // Subreddit Services
  export const subredditService = {
    createSubreddit: async (subredditData: any) => {
      const response = await fetch(`${API_BASE_URL}/subreddits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(), 
        },
        body: JSON.stringify(subredditData),
      });
      return handleResponse(response);
    },
  
    getAllSubreddits: async () => {
      const response = await fetch(`${API_BASE_URL}/subreddits`, {
        headers: getAuthHeader(), 
      });
      return handleResponse(response);
    },
  
    getSubredditByName: async (name: string) => {
      const response = await fetch(`${API_BASE_URL}/subreddits/${name}`, {
        headers: getAuthHeader(), 
      });
      return handleResponse(response);
    },

    getSubredditById: async (subredditId: string) => {
      const response = await fetch(`${API_BASE_URL}/subreddits/id/${subredditId}`, {
        headers: getAuthHeader(),
      });
      return handleResponse(response);
    },
  
    deleteSubreddit: async (subredditId: string) => {
      const response = await fetch(`${API_BASE_URL}/subreddits/${subredditId}`, {
        method: 'DELETE',
        headers: getAuthHeader(), 
      });
      return handleResponse(response);
    },
  };
  
  // Vote Services
  export const voteService = {
    castVote: async (voteData: { post: string; value: number }) => {
      // Get user ID from the current user
      const user = authService.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const response = await fetch(`${API_BASE_URL}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ ...voteData }),
      });
      return handleResponse(response);
    },
  
    getPostVotes: async (postId: string) => {
      const response = await fetch(`${API_BASE_URL}/votes/post/${postId}`, {
        headers: getAuthHeader(),
      });
      return handleResponse(response);
    },
  };
  
  // User Services
  export const userService = {
    register: async (userData: any) => {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },
  
    getAllUsers: async () => {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeader(), 
      });
      return handleResponse(response);
    },
  
    deleteUser: async (userId: string) => {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeader(), 
      });
      return handleResponse(response);
    },
    getUserByName: async (username: string) => {
        const response = await fetch(`${API_BASE_URL}/users/username/${username}`, {
          headers: getAuthHeader(),
        });
        return handleResponse(response);
      },
  
    getCurrentUser: async () => {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: getAuthHeader(), 
      });
      return handleResponse(response);
    },
  };

  // Search Services
  export const searchService = {
    search: async (query: string, subreddit?: string) => {
      let url = `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`;
      
      if (subreddit) {
        url += `&subreddit=${encodeURIComponent(subreddit)}`;
      }
      
      const response = await fetch(url, {
        headers: getAuthHeader(),
      });
      
      return handleResponse(response);
    }
  };