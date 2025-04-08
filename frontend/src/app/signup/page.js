'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/signup', {
                email,
                password
            });
            toast.success('Account created successfully!');
            router.push('/login');
        } catch (err) {
            console.error(err);
            toast.error('Signup failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <Toaster />
            <div className="container col-xl-10 col-xxl-8 px-4 py-5">
                <div className="align-items-center col-md-10 mx-auto col-lg-5 py-5">
                    <form onSubmit={handleSignup} className="p-4 p-md-5 border rounded-3 bg-body-tertiary">
                        <div className="form-floating mb-3">
                            <input type="email" className="form-control" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                            <label htmlFor="email">Email</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" className="form-control" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
                            <label htmlFor="password">Password</label>
                        </div>
                        <button className="w-100 btn btn-lg btn-primary" type="submit" disabled={loading}>Sign Up</button>
                        <div className="mt-3">
                            <span>Already have an account? </span>
                            <a href="/login">Login</a>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
