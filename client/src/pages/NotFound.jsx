import { Link } from 'react-router-dom';

export default function NotFound() {
  return <main className="not-found"><span className="not-found-code">404</span><h1>We can’t find that page.</h1><p>The address may be incorrect, or the page may have moved.</p><Link className="button button-primary" to="/">Back to overview</Link></main>;
}
