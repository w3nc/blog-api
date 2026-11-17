// Login screen: username + password, then save the token and go to the posts list.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { saveSession, getUser } from '../lib/auth.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Already signed in? Skip the form.
  if (getUser()) {
    navigate('/posts', { replace: true });
    return null;
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await api.post('/auth/login', { username: username.trim(), password });
      saveSession(data.token, data.user);
      navigate('/posts', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit} noValidate>
        <h1 className="login-title">Sign in</h1>
        <p className="muted">Author dashboard for Notes from the Terminal.</p>

        <label htmlFor="login-user" className="field-label">Username</label>
        <input
          id="login-user"
          className="input"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="login-pass" className="field-label">Password</label>
        <input
          id="login-pass"
          className="input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </div>
  );
}
