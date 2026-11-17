// Home page: featured post on top, then the "Latest articles" feed, with the sidebar on the right.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api.js';
import PostCard, { TagList } from '../components/PostCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Illustration from '../components/Illustration.jsx';
import { artFor } from '../illustrations.js';
import { formatDate, initials, displayName, commentLabel, avatarColor, readingTime } from '../format.js';

export default function HomePage() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet('/posts')
      .then((data) => setPosts(data.posts))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="container page-message"><p role="alert">{error}</p></div>;
  if (!posts) return <div className="container page-message"><p>Loading articles...</p></div>;

  // The newest post is the featured one; the rest form the feed.
  const [featured, ...rest] = posts;
  const topics = [...new Set(posts.flatMap((p) => p.tags))];

  return (
    <div className="container home-layout">
      <main className="main-col">
        {featured ? (
          <section className="featured" aria-labelledby="featured-title">
            <Link to={`/posts/${featured.id}`} className="featured-thumb" tabIndex={-1} aria-hidden="true">
              <Illustration variant={featured.id + 1} width={520} height={272} src={artFor(featured.id)} label={featured.title} />
            </Link>
            <time className="meta" dateTime={featured.createdAt}>{formatDate(featured.createdAt)}</time>
            <h2 id="featured-title" className="featured-title">
              <Link to={`/posts/${featured.id}`}>{featured.title}</Link>
            </h2>
            <p className="featured-summary">{featured.summary}</p>
            <p className="byline">
              <span className="avatar" style={{ background: avatarColor(featured.author.username) }} aria-hidden="true">
                {initials(featured.author.username)}
              </span>
              <span>{displayName(featured.author.username)}</span>
              <span className="dot" aria-hidden="true">·</span>
              <span>{readingTime(featured.summary)} min read</span>
              <span className="dot" aria-hidden="true">·</span>
              <span>{commentLabel(featured.commentCount)}</span>
            </p>
          </section>
        ) : (
          <p className="muted">No articles yet. Check back soon.</p>
        )}

        {rest.length > 0 && (
          <section className="feed" aria-labelledby="latest-title">
            <h2 id="latest-title" className="section-label">Latest articles</h2>
            {rest.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>
        )}
      </main>
      <Sidebar topics={topics} />
    </div>
  );
}
