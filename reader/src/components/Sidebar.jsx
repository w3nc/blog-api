// Right sidebar: newsletter box and the list of topics.
// The newsletter is not connected to an email service yet; it only shows a thank-you message.
import { useState } from 'react';
import { TagList } from './PostCard.jsx';

export default function Sidebar({ topics }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const subscribe = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }
    setMessage('Thanks! You are on the list.');
    setEmail('');
  };

  return (
    <aside className="sidebar" aria-label="Sidebar">
      <section className="side-box">
        <h2 className="side-title">Get new posts by email</h2>
        <p className="muted">One short email a week. No spam.</p>
        <form onSubmit={subscribe} noValidate>
          <label htmlFor="newsletter-email" className="field-label">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <button type="submit" className="btn btn-primary btn-block">Subscribe</button>
          <p className="form-message" role="status">{message}</p>
        </form>
      </section>
      <section className="side-box">
        <h2 className="side-title">Topics</h2>
        <TagList tags={topics} />
      </section>
    </aside>
  );
}
