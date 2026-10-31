import { Link, useLocation } from 'react-router-dom';
import Brand from './Brand.jsx';

export default function Nav() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Brand />
        <nav className="flex items-center gap-1.5">
          <Link to="/admin/login" className="btn-ghost">Staff login</Link>
          {pathname !== '/inquiry' && (
            <Link to="/inquiry" className="btn-primary !min-h-[44px] !px-5 !text-[15px]">Send an inquiry</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
