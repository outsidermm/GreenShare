'use client';

import { useState } from 'react';
import Link from 'next/link';
import registerUser from '../services/registerUser';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const[firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      const csrf_token = await registerUser(email, password , firstName, lastName);
      localStorage.setItem('csrfToken', csrf_token);
      setPassword("");
      setEmail("");
      setFirstName("");
      setLastName("");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="max-w-md m-auto shadow-slate-200 shadow-lg rounded-sm p-6 px-10 w-1/2 min-w-fit">
      <h1 className="text-4xl text-center text-slate-800 font-bold">Registration</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-5 mt-5">
        <div>
          <label className="block mb-2 text-slate-800">First Name</label>
          <input
            type="text"
            placeholder='John'
            minLength={2}
            maxLength={50}
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border border-slate-500 text-slate-500 rounded py-2 px-3 w-full"
          />
        </div>
        <div className='pt-5'>
          <label className="block mb-2 text-slate-800">Last Name</label>
          <input
            type="text"
            placeholder='Smith'
            minLength={2}
            maxLength={50}
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border border-slate-500 text-slate-500 rounded py-2 px-3 w-full"
          />
        </div>
        <div className='pt-5'>
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
        <div className="pt-5">
          <label className="block mb-2 text-slate-800">Password</label>
          <input
            type="password"
            placeholder='&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;'
            required
            minLength={8}
            maxLength={32}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-slate-500 text-slate-500 rounded py-2 px-3 w-full"
          />
        </div>
        <div className='py-5'>
          <label htmlFor="agreement-box" className="inline-flex items-center text-slate-800">
            <input type="checkbox" id="agreement-box" value="yes" className="mr-2" required />
            I agree to the terms of service.
          </label>
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
            Register
          </button>
        </div>
        <div className="pt-5 text-center text-slate-500">
          <p>Already have an account?&nbsp;
            <Link href="/login" className="text-blue-500 hover:text-blue-700">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}