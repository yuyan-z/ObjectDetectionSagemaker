'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const linkClass = (path) =>
    `nav-link px-2 ${pathname === path ? 'text-secondary' : 'text-white'}`;

  return (
    <header className="p-3 text-bg-dark">
      <div className="container">
        <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
          <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
            <li><Link href="/" className={linkClass('/')}>Home</Link></li>
            <li><Link href="#" className={linkClass('/features')}>Features</Link></li>
            <li><Link href="#" className={linkClass('/pricing')}>Pricing</Link></li>
            <li><Link href="#" className={linkClass('/faqs')}>FAQs</Link></li>
            <li><Link href="#" className={linkClass('/about')}>About</Link></li>
          </ul>

          <div className="text-end">
            <button type="button" className="btn btn-light me-2" onClick={() => router.push('/signup')}>Sign-up</button>
            <button type="button" className="btn btn-primary" onClick={() => router.push('/login')}>Login</button>
          </div>
        </div>
      </div>
    </header>
  );
}
