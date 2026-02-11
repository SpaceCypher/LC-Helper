'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push(from);
                router.refresh();
            } else {
                setError('Invalid password');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                    Password
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-glass-light border border-glass-border rounded-glass p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    placeholder="Enter app password"
                    required
                />
            </div>

            {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-white py-3 rounded-glass font-medium tracking-wide hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
                {loading ? 'Checking...' : 'Login'}
            </button>
        </form>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-text-primary p-4">
            <div className="glass-card p-8 w-full max-w-md animate-slide-up">
                <h1 className="text-2xl font-light mb-6 text-center">LC Helper Login</h1>
                <Suspense fallback={<div className="text-center p-4">Loading login form...</div>}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
