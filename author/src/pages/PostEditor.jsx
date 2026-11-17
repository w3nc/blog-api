// New / Edit post form: title, a simple formatting toolbar, body, tags,
// and two buttons - "Save draft" (keeps it hidden) and "Publish" (makes it live).
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { parseTags } from '../lib/format.js';

export default function PostEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const bodyRef = useRef(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [issues, setIssues] = useState([]);
  const [status, setStatus] = useState('');

  // In edit mode, load the existing post into the form.
  useEffect(() => {
    if (!isEdit) return;
    api
      .get('/admin/posts')
      .then((data) => {
        const post = data.posts.find((p) => String(p.id) === String(id));
        if (!post) throw new Error('Post not found.');
        setTitle(post.title);
        setContent(post.content);
        setTagsText((post.tags || []).join(', '));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  // Wraps the selected text in the body with a Markdown-style marker,
  // e.g. **bold**, `code`, or [link](url). Nothing is selected -> inserts the marker alone.
  const wrap = (before, after = before, placeholder = 'text') => {
    const el = bodyRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  // Sends the form. `published` decides whether the post goes live.
  const save = async (published) => {
    setSaving(published ? 'publish' : 'draft');
    setError('');
    setIssues([]);
    setStatus('');
    const body = { title, content, tags: parseTags(tagsText) };
    try {
      if (isEdit) {
        // PUT replaces title, content and tags; the published flag is set on its own call.
        await api.put(`/posts/${id}`, body);
        const current = await api.get('/admin/posts');
        const post = current.posts.find((p) => String(p.id) === String(id));
        if (post && post.published !== published) {
          await api.patch(`/posts/${id}/publish`, { published });
        }
      } else {
        await api.post('/posts', { ...body, published });
      }
      navigate('/posts', { replace: true });
    } catch (err) {
      setError(err.message);
      setIssues(err.issues || []);
      setStatus('');
    } finally {
      setSaving('');
    }
  };

  if (loading) return <p className="muted">Loading post...</p>;

  return (
    <section className="editor-wrap">
      <div className="page-head">
        <h1>{isEdit ? 'Edit post' : 'New post'}</h1>
        <Link to="/posts" className="btn">Back to posts</Link>
      </div>

      <form className="editor-card" onSubmit={(e) => e.preventDefault()} noValidate>
        <label htmlFor="post-title" className="field-label">Title</label>
        <input
          id="post-title"
          className="input"
          maxLength={250}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="post-tags" className="field-label">Topic tags</label>
        <input
          id="post-tags"
          className="input"
          placeholder="node.js, express, auth"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
        />
        <p className="hint">Separate tags with commas. Up to 6.</p>

        <div className="toolbar" role="toolbar" aria-label="Formatting">
          <button type="button" className="btn tool-btn" onClick={() => wrap('**', '**', 'bold text')} aria-label="Bold"><b>B</b></button>
          <button type="button" className="btn tool-btn" onClick={() => wrap('*', '*', 'italic text')} aria-label="Italic"><i>I</i></button>
          <button type="button" className="btn tool-btn" onClick={() => wrap('`', '`', 'code')} aria-label="Inline code">{'</>'}</button>
          <button type="button" className="btn tool-btn" onClick={() => wrap('[', '](https://)', 'link text')} aria-label="Link">Link</button>
        </div>

        <label htmlFor="post-body" className="field-label">Body</label>
        <textarea
          id="post-body"
          ref={bodyRef}
          className="input textarea body-input"
          rows={14}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <p className="hint">Leave a blank line between paragraphs. Put code between lines of three backticks.</p>

        {error && <p className="form-error" role="alert">{error}</p>}
        {issues.length > 0 && (
          <ul className="form-error-list">
            {issues.map((i, n) => (
              <li key={n}>{i.message}</li>
            ))}
          </ul>
        )}

        <div className="editor-actions">
          <button
            type="button"
            className="btn"
            disabled={Boolean(saving)}
            onClick={() => save(false)}
          >
            {saving === 'draft' ? 'Saving...' : 'Save draft'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={Boolean(saving)}
            onClick={() => save(true)}
          >
            {saving === 'publish' ? 'Publishing...' : 'Publish'}
          </button>
        </div>
        {status && <p className="form-message" role="status">{status}</p>}
      </form>
    </section>
  );
}
