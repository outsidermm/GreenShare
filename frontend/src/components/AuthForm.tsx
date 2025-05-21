'use client'

import { useState } from "react";
import {RiEyeFill, RiEyeOffFill} from "react-icons/ri";

interface CredentialsFormProps {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  emailChanged: boolean;
  setEmailChanged: (changed: boolean) => void;
  pwdChanged: boolean;
  setPwdChanged: (changed: boolean) => void;
}

export default function AuthForm(props: CredentialsFormProps) {
    const { email, password, setEmail, setPassword , emailChanged, setEmailChanged, pwdChanged, setPwdChanged
    } = props;

    const [isPwdHidden, setIsPwdHidden] = useState(true);


    return (
        <>
            <div className='pt-5'>
            <label className="block mb-2 text-slate-800">Email Address</label>
            <input
                type="email"
                placeholder="Enter your email"
                minLength={3}
                maxLength={320}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailChanged(true)}
                className={`border-slate-500 text-slate-500 rounded py-2 px-3 w-full ${emailChanged ? 'invalid:border-red-500' : ''} border-2`}
            />
            </div>
            <div className="pt-5">
            <label className="block mb-2 text-slate-800">Password</label>
            <div className='relative'>
                <input
                type={isPwdHidden ? "password" : "text"}
                placeholder='Enter your password'
                required
                minLength={8}
                maxLength={32}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPwdChanged(true)}
                className={`border-slate-500 text-slate-500 rounded py-2 px-3 w-full ${pwdChanged ? 'invalid:border-red-500' : ''} border-2`}
                />
                <button
                type="button"
                onClick={() => setIsPwdHidden(!isPwdHidden)}
                className="text-sm text-slate-500 hover:underline mt-2 absolute top-1.5 right-3"
                >
                {isPwdHidden ? <RiEyeOffFill /> : <RiEyeFill />}
                </button>
            </div>
            </div>
        </>
    );
}