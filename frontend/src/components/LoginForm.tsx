'use client';

import { useState } from 'react';
import loginUser from '../services/loginUser';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      const data = await loginUser(email, password);
      setMessage(data.message);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="max-w-md m-auto shadow-slate-200 shadow-lg rounded-sm p-6 px-10 w-1/2 min-w-fit">
      <h1 className="text-4xl text-center text-slate-800 font-bold">Login</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-5 mt-5">
        <div>
          <label className="block mb-2 text-slate-800">Email Address</label>
          <input
            type="email"
            placeholder="example@example.com"
            minLength={3}
            maxLength={320}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-slate-500 text-slate-500 rounded py-2 px-3 w-full"
          />
        </div>
        <div className="py-5">
          <label className="block mb-2 text-slate-800">Password</label>
          <input
            type="password"
            required
            minLength={8}
            maxLength={32}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-slate-500 text-slate-500 rounded py-2 px-3 w-full"
          />
        </div>
        {message && (
          <div className="text-red-500 text-sm text-center mb-2">
            {message}
          </div>
        )}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full rounded bg-blue-300 hover:bg-blue-700 text-white font-bold py-2 px-4 border-solid border-2 border-blue-300">
            Login
          </button>
        </div>
        <div className="pt-5 text-center text-slate-500">
          <p>Don&apos;t have an account?&nbsp;
            <a href="/register" className="text-blue-500 hover:text-blue-700">
              Sign Up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}