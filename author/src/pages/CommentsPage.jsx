// Comment moderation: every comment with its post title, plus Edit and Delete.
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { longDate } from '../lib/format.js';

export default function CommentsPage() {
  const [comments, setComments] = useState(null);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');

  const load = () =>
    api
      .get('/admin/comments')
      .then((data) => setComments(data.comments))
      .catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const remove = async (c) => {
    if (!window.confirm('Delete this comment? This cannot be undone.')) return;
    setError('');
    try {
      await api.del(`/comments/${c.id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const saveEdit = async (c) => {
    if (!draft.trim()) {
      setError('A comment cannot be empty.');
      return;
    }
    setError('');
    try {
      await api.put(`/comments/${c.id}`, { content: draft.trim() });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>Comments</h1>
      </div>
      <p className="muted">Newest first. Edit a comment to fix a typo, or delete it if it is spam.</p>

      {error && <p className="form-error" role="alert">{error}</p>}

      {!comments ? (
        <p className="muted">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="muted">No comments yet.</p>
      ) : (
        <ul className="comment-admin-list">
          {comments.map((c) => (
            <li key={c.id} className="comment-admin">
              <div className="comment-admin-head">
                <strong>{c.authorName}</strong>
                <span className="muted">on {c.post?.title || 'a deleted post'}</span>
                <span className="muted">{longDate(c.createdAt)}</span>
              </div>

              {editingId === c.id ? (
                <div>
                  <label htmlFor={`edit-${c.id}`} className="field-label">Edit comment</label>
                  <textarea
                    id={`edit-${c.id}`}
                    className="input textarea"
                    rows={3}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <div className="action-row">
                    <button type="button" className="btn btn-primary" onClick={() => saveEdit(c)}>Save</button>
                    <button type="button" className="btn" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="comment-admin-text">{c.content}</p>
                  <div className="action-row">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        setEditingId(c.id);
                        setDraft(c.content);
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => remove(c)}>Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
