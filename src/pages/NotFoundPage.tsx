import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-20 text-center">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Link to="/" className="text-sm underline">
        Go home
      </Link>
    </div>
  );
}
