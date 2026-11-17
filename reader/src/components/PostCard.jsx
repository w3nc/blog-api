// One article row in the "Latest articles" feed:
// date, bold title, summary, author avatar, comment count, tags and a side thumbnail.
import { Link } from 'react-router-dom';
import Illustration from './Illustration.jsx';
import { artFor } from '../illustrations.js';
import { formatDate, initials, displayName, commentLabel, avatarColor } from '../format.js';

export default function PostCard({ post }) {
  const name = displayName(post.author.username);
  return (
    <article className="post-card">
      <div className="post-card-text">
        <time className="meta" dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
        <h3 className="post-card-title">
          <Link to={`/posts/${post.id}`}>{post.title}</Link>
        </h3>
        <p className="post-card-summary">{post.summary}</p>
        <p className="byline">
          <span className="avatar" style={{ background: avatarColor(post.author.username) }} aria-hidden="true">
            {initials(post.author.username)}
          </span>
          <span>{name}</span>
          <span className="dot" aria-hidden="true">·</span>
          <span>{commentLabel(post.commentCount)}</span>
        </p>
        <TagList tags={post.tags} />
      </div>
      <Link to={`/posts/${post.id}`} className="post-card-thumb" tabIndex={-1} aria-hidden="true">
        <Illustration variant={post.id} width={260} height={136} src={artFor(post.id)} label={post.title} />
      </Link>
    </article>
  );
}

// Blue pills with the topic names. Shared with the post page.
export function TagList({ tags = [] }) {
  if (!tags.length) return null;
  return (
    <ul className="tag-list" aria-label="Topics">
      {tags.map((t) => (
        <li key={t} className="tag">{t}</li>
      ))}
    </ul>
  );
}
