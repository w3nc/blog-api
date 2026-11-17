// Posts table: title, status pill (Published / Draft with a text label),
// updated date and the actions Publish/Unpublish, Edit, Delete.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { shortDate } from '../lib/format.js';

export default function PostsPage() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () =>
    api
      .get('/admin/posts')
      .then((data) => setPosts(data.posts))
      .catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const togglePublish = async (post) => {
    setBusyId(post.id);
    setError('');
    try {
      await api.patch(`/posts/${post.id}/publish`, { published: !post.published });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? Its comments go too. This cannot be undone.`)) return;
    setBusyId(post.id);
    setError('');
    try {
      await api.del(`/posts/${post.id}`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>All posts</h1>
        <Link to="/posts/new" className="btn btn-primary">New post</Link>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      {!posts ? (
        <p className="muted">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="muted">No posts yet. Click "New post" to write your first one.</p>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Status</th>
                <th scope="col">Updated</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="title-cell">{post.title}</td>
                  <td>
                    {post.published ? (
                      <span className="pill pill-published">Published</span>
                    ) : (
                      <span className="pill pill-draft">Draft</span>
                    )}
                  </td>
                  <td className="muted">{shortDate(post.updatedAt)}</td>
                  <td>
                    <div className="action-row">
                      <button
                        type="button"
                        className="btn"
                        disabled={busyId === post.id}
                        onClick={() => togglePublish(post)}
                      >
                        {post.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <Link to={`/posts/${post.id}/edit`} className="btn">Edit</Link>
                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled={busyId === post.id}
                        onClick={() => remove(post)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
