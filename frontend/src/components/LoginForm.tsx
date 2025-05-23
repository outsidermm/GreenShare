'use client';

import { useState } from 'react';
import Link from 'next/link';
import loginUser from '../services/loginUser';
import PasswordInput from './PasswordInput';
import CredentialsInput from './CredentialsInput';
import { useRouter} from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorType, setErrorType] = useState('');

  const [emailChanged, setEmailChanged] = useState(false);
  const [pwdChanged, setPwdChanged] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);


  const handleSubmit = async () => {
    try {
      const csrf_token = await loginUser(email, password);
      localStorage.setItem('csrfToken', csrf_token);
      setPassword("");
      setEmail("");
      setErrorType("");

      setEmailChanged(false);
      setPwdChanged(false);

      setShowSuccess(true);
      setTimeout(() => {
        router.replace("/");
      }, 500);

    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes("email")) {
          setErrorType("email");
        }
        else if (err.message.toLowerCase().includes("password")) {
          setErrorType("password");
        }
        else {
          setErrorType(err.message);
          console.log("Error: ", err.message);
        }
      }
    }
  };

  return (
    <div className="sm:max-w-xl shadow-slate-200 shadow-xl rounded-2xl p-6 px-10 sm:min-w-md w-11/12 bg-white">
      <h1 className="text-4xl text-center text-slate-800 font-bold">Login</h1>
      {showSuccess && (
        <div className="text-white text-sm text-center mb-2 bg-green-500 rounded-lg py-2 px-4 mt-5 transition-all">
          Login successful! Redirecting to homepage...
        </div>
      )}
      {!["", "email", "password"].includes(errorType) && (
        <div className="text-white text-sm text-center mb-2 bg-red-500 rounded-lg py-2 px-4 mt-5 transition-all">
          {errorType}
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-5 mt-5">
        <CredentialsInput
          type="email"
          placeholder="Enter your email"
          minLength={3}
          maxLength={320}
          required
          credential={email}
          setCredential={setEmail}
          credentialChanged={emailChanged}
          setCredentialChanged={setEmailChanged}
          credentialError={errorType === "email" ? "Email does not exist" : ""}
          label="Email Address"
        />
        <PasswordInput
          password={password}
          setPassword={setPassword}
          pwdChanged={pwdChanged}
          setPwdChanged={setPwdChanged}
          passwordError={errorType === "password" ? "Invalid password" : ""}
        />
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