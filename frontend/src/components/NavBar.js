'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

import styles from './NavBar.module.css';

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check userid exists
    const userid = localStorage.getItem('userid') || sessionStorage.getItem('userid');
    setIsLoggedIn(!!userid); // true if userid exists
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_API}/logout`, {}, {
        withCredentials: true,
      });

      localStorage.removeItem('userid');
      sessionStorage.removeItem('userid');
      setIsLoggedIn(false);
  
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const linkClass = (path) =>
    `nav-link px-2 ${pathname === path ? 'text-primary' : 'text-secondary'}`;

  return (
    <header className="p-3 text-bg-light">
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
            {isLoggedIn ? (
              <button type="button" className="btn btn-dark" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <>
                <button type="button" className={`btn btn-outline-primary ${styles.login} me-2`} onClick={() => router.push('/signup')}>Sign-up</button>
                <button type="button" className="btn btn-primary" onClick={() => router.push('/login')}>Login</button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>


  );
}
