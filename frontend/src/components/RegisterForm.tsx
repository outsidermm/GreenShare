'use client';

import {useState} from 'react';
import Link from 'next/link';
import registerUser from '../services/registerUser';
import AuthForm from './AuthForm';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const[firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');

  const [firstNameChanged, setFirstNameChanged] = useState(false);
  const [lastNameChanged, setLastNameChanged] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const [pwdChanged, setPwdChanged] = useState(false);


  const handleSubmit = async () => {
    try {
      const csrf_token = await registerUser(email, password , firstName, lastName);
      localStorage.setItem('csrfToken', csrf_token);
      setPassword("");
      setEmail("");
      setFirstName("");
      setLastName("");
      setMessage("")
      setFirstNameChanged(false);
      setLastNameChanged(false);
      setEmailChanged(false);
      setPwdChanged(false);

    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="sm:max-w-xl shadow-slate-200 shadow-xl rounded-2xl p-6 px-10 sm:min-w-md w-11/12 bg-white">
      <h1 className="text-4xl text-center text-slate-800 font-bold">Registration</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-5 mt-5">
        <div>
          <label className="block mb-2 text-slate-800">First Name</label>
          <input
            type="text"
            placeholder='Enter your first name'
            minLength={2}
            maxLength={50}
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onFocus={() => setFirstNameChanged(true)}
            className={`border-slate-500 text-slate-500 rounded py-2 px-3 w-full ${firstNameChanged ? 'invalid:border-red-500' : ''}  border-2`}
          />
        </div>
        <div className='pt-5'>
          <label className="block mb-2 text-slate-800">Last Name</label>
          <input
            type="text"
            placeholder='Enter your last name'
            minLength={2}
            maxLength={50}
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onFocus={() => setLastNameChanged(true)}
            className={`border-slate-500 text-slate-500 rounded py-2 px-3 w-full ${lastNameChanged ? 'invalid:border-red-500' : ''} border-2`}
          />
        </div>
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
            className="w-full rounded bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-solid border-2 border-blue-500 transition-all">
            Create an Account
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