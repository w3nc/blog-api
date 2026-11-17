// Comments under an article: the list (oldest first) and a form with name + comment.
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api.js';
import { formatDate, initials, avatarColor } from '../format.js';

export default function CommentSection({ postId, initialCount, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);

  // Load the comments whenever the post changes.
  useEffect(() => {
    apiGet(`/posts/${postId}/comments`)
      .then((data) => setComments(data.comments))
      .catch((err) => setLoadError(err.message));
  }, [postId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      setFormError('Please add your name and a comment.');
      return;
    }
    setSending(true);
    setFormError('');
    try {
      const data = await apiPost(`/posts/${postId}/comments`, { authorName: name.trim(), content: text.trim() });
      const next = [...comments, data.comment];
      setComments(next);
      onCountChange?.(next.length);
      setText('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSending(false);
    }
  };

  const count = comments.length || initialCount;

  return (
    <section className="comments" aria-labelledby="comments-title">
      <h2 id="comments-title" className="comments-title">{count} {count === 1 ? 'comment' : 'comments'}</h2>

      <form className="comment-form" onSubmit={submit} noValidate>
        <div className="form-row">
          <label htmlFor="comment-name" className="field-label">Name</label>
          <input
            id="comment-name"
            className="input"
            placeholder="Your name"
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="comment-text" className="field-label">Comment</label>
          <textarea
            id="comment-text"
            className="input textarea"
            rows={4}
            placeholder="Share a thought"
            maxLength={2000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? 'Posting...' : 'Post comment'}
        </button>
        {formError && <p className="form-error" role="alert">{formError}</p>}
      </form>

      {loadError && <p className="form-error" role="alert">{loadError}</p>}

      <ul className="comment-list">
        {comments.map((c) => (
          <li key={c.id} className="comment">
            <span className="avatar" style={{ background: avatarColor(c.authorName) }} aria-hidden="true">
              {initials(c.authorName)}
            </span>
            <div>
              <p className="comment-meta">
                <strong>{c.authorName}</strong>
                <span className="dot" aria-hidden="true">·</span>
                <time dateTime={c.createdAt}>{formatDate(c.createdAt)}</time>
              </p>
              <p className="comment-text">{c.content}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
