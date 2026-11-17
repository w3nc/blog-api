// The page frame (header, footer) and the two routes of the public site.
import { Link, Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import HomePage from './pages/HomePage.jsx';
import PostPage from './pages/PostPage.jsx';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <div id="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts/:id" element={<PostPage />} />
          <Route
            path="*"
            element={
              <div className="container narrow page-message">
                <h1>Page not found</h1>
                <p>The page you are looking for does not exist.</p>
                <Link to="/">Back to all articles</Link>
              </div>
            }
          />
        </Routes>
      </div>
      <footer className="site-footer">Built for The Odin Project Blog API assignment</footer>
    </>
  );
}
