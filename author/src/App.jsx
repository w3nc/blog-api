// Dashboard frame: top nav (Posts, Comments, New post, Log out) and the routes.
// Every page except Login sits behind RequireAuth, so a signed-out visitor sees the login screen.
import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { getUser, clearSession } from './lib/auth.js';
import LoginPage from './pages/LoginPage.jsx';
import PostsPage from './pages/PostsPage.jsx';
import CommentsPage from './pages/CommentsPage.jsx';
import PostEditor from './pages/PostEditor.jsx';

// Shows the login page unless a session is saved. Re-checks when the API says the token expired.
function RequireAuth({ children }) {
  const [user, setUser] = useState(getUser());
  useEffect(() => {
    const expired = () => setUser(null);
    window.addEventListener('session-expired', expired);
    return () => window.removeEventListener('session-expired', expired);
  }, []);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Shell({ children }) {
  const navigate = useNavigate();
  const user = getUser();
  const logout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };
  return (
    <>
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link to="/posts" className="logo">
            <span className="logo-mark" aria-hidden="true" />
            <span>Author dashboard</span>
          </Link>
          <nav className="admin-nav" aria-label="Dashboard">
            <NavLink to="/posts">Posts</NavLink>
            <NavLink to="/comments">Comments</NavLink>
            <NavLink to="/posts/new">New post</NavLink>
          </nav>
          <div className="admin-user">
            <span className="muted">Signed in as {user?.username}</span>
            <button type="button" className="btn" onClick={logout}>Log out</button>
          </div>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Shell>
              <Routes>
                <Route path="/" element={<Navigate to="/posts" replace />} />
                <Route path="/posts" element={<PostsPage />} />
                <Route path="/posts/new" element={<PostEditor />} />
                <Route path="/posts/:id/edit" element={<PostEditor />} />
                <Route path="/comments" element={<CommentsPage />} />
                <Route path="*" element={<p className="page-message">Page not found.</p>} />
              </Routes>
            </Shell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
