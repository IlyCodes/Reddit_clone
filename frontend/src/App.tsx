import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SubredditPage from "./pages/SubredditPage";
import SubmitPage from "./pages/SubmitPage";
import PostPage from "./pages/PostPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "./styles/App.css";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return ( 
      // App.tsx
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="r/:subredditName" element={<SubredditPage />} />
            <Route path="r/:subredditName/submit" element={<ProtectedRoute />}>
              <Route index element={<SubmitPage />} />
            </Route>
            <Route path="u/:username" element={<ProfilePage />} />
            <Route path="post/:postId" element={<PostPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
  );
}

export default App;
