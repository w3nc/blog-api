// Post page: a narrow reading column with the article, then the comments.
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../api.js';
import Illustration from '../components/Illustration.jsx';
import { artFor } from '../illustrations.js';
import { TagList } from '../components/PostCard.jsx';
import CommentSection from '../components/CommentSection.jsx';
import { formatDate, initials, displayName, avatarColor, readingTime } from '../format.js';

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setPost(null);
    setError('');
    apiGet(`/posts/${id}`)
      .then((data) => setPost(data.post))
      .catch((err) => setError(err.message));
  }, [id]);

  // Keeps the comment count in the byline in step with the comment list.
  const onCountChange = useCallback((count) => {
    setPost((p) => (p ? { ...p, commentCount: count } : p));
  }, []);

  if (error) {
    return (
      <div className="container narrow page-message">
        <h1>Article not found</h1>
        <p role="alert">{error}</p>
        <Link to="/">Back to all articles</Link>
      </div>
    );
  }
  if (!post) return <div className="container narrow page-message"><p>Loading article...</p></div>;

  // Paragraphs are split by blank lines. A block that starts with ``` is shown as a code block.
  const blocks = post.content.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return (
    <article className="container narrow article">
      <TagList tags={post.tags} />
      <h1 className="article-title">{post.title}</h1>
      <p className="byline">
        <span className="avatar" style={{ background: avatarColor(post.author.username) }} aria-hidden="true">
          {initials(post.author.username)}
        </span>
        <span>{displayName(post.author.username)}</span>
        <span className="dot" aria-hidden="true">·</span>
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
        <span className="dot" aria-hidden="true">·</span>
        <span>{readingTime(post.content)} min read</span>
      </p>

      <Illustration variant={post.id} width={720} height={300} src={artFor(post.id)} label={post.title} />

      <div className="article-body">
        {blocks.map((block, i) =>
          block.startsWith('```') ? (
            <pre key={i} className="code-block"><code>{block.replace(/^```\w*\n?|```$/g, '')}</code></pre>
          ) : (
            <p key={i}>{block}</p>
          )
        )}
      </div>

      <CommentSection postId={post.id} initialCount={post.commentCount} onCountChange={onCountChange} />
    </article>
  );
}
