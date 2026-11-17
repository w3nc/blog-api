// Top bar: logo, plain topic links and the Subscribe button.
import { Link } from 'react-router-dom';

const TOPICS = ['Everything', 'Node.js', 'Databases', 'Career', 'Podcast'];

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo" aria-label="Notes from the Terminal home">
          <span className="logo-mark" aria-hidden="true" />
          <span>Notes from the Terminal</span>
        </Link>
        <nav className="topnav" aria-label="Topics">
          {TOPICS.map((t) => (
            <Link key={t} to="/">{t}</Link>
          ))}
        </nav>
        <button type="button" className="btn btn-primary header-subscribe">Subscribe</button>
      </div>
    </header>
  );
}
