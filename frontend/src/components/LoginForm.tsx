'use client';

import { useState } from 'react';
import Link from 'next/link';
import loginUser from '../services/loginUser';
import AuthForm from './AuthForm';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const [emailChanged, setEmailChanged] = useState(false);
  const [pwdChanged, setPwdChanged] = useState(false);

  const handleSubmit = async () => {
    try {
      const csrf_token = await loginUser(email, password);
      localStorage.setItem('csrfToken', csrf_token);
      setPassword("");
      setEmail("");
      setMessage("")
      setEmailChanged(false);
      setPwdChanged(false);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="sm:max-w-xl shadow-slate-200 shadow-xl rounded-2xl p-6 px-10 sm:min-w-md w-11/12 bg-white">
      <h1 className="text-4xl text-center text-slate-800 font-bold">Login</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-5 mt-5">
        <AuthForm
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          emailChanged={emailChanged}
          setEmailChanged={setEmailChanged}
          pwdChanged={pwdChanged}
          setPwdChanged={setPwdChanged}
        />
        {message && (
          <div className="text-red-500 text-sm text-center mb-2">
            {message}
          </div>
        )}
        <div className="pt-10">
          <button
            type="submit"
            className="w-full rounded bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-solid border-2 border-blue-500 transition-all">
            Login
          </button>
        </div>
        <div className="pt-5 text-center text-slate-500">
          <p>Don&apos;t have an account?&nbsp;
            <Link href="/register" className="text-blue-500 hover:text-blue-700">
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}