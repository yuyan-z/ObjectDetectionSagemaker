'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleLogin = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_API}/login`,
                { email, password },
                { withCredentials: true } // Allow backend to set cookies
              );
            toast.success('Login successful.');

            if (rememberMe) {
                localStorage.setItem('userid', res.data.user._id);
            } else {
                 sessionStorage.setItem('userid', res.data.user._id);
            }

            router.push('/dashboard');  // Redirect to the dashboard page
        } catch (err) {
            console.error(err);
            toast.error('Login failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <Toaster />
            <div className="container col-xl-10 col-xxl-8 px-4 py-5">
                <div className="align-items-center col-md-10 mx-auto col-lg-5 py-5">
                    <form onSubmit={handleLogin} className="p-4 p-md-5 border rounded-3 bg-body-tertiary">
                        <div className="form-floating mb-3">
                            <input type="email" className="form-control" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                            <label htmlFor="email">Email</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" className="form-control" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
                            <label htmlFor="password">Password</label>
                        </div>
                        <div className="checkbox mb-3">
                            <label>
                                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} /> Remember me
                            </label>
                        </div>
                        <button className="w-100 btn btn-lg btn-primary" type="submit" disabled={loading}>Login</button>
                        <div className="mt-3 text-body-secondary">
                            <span>Don't have an account? </span>
                            <a href="/signup">Sign up</a>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
