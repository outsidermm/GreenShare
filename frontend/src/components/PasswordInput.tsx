"use client";

import { useState } from "react";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";

interface PasswordInputProps {
  password: string;
  setPassword: (password: string) => void;
  pwdChanged: boolean;
  setPwdChanged: (changed: boolean) => void;
  passwordError: string;
  placeholder?: string;
}

// PasswordInput is a reusable component for entering passwords with toggle visibility and error display
export default function PasswordInput(props: PasswordInputProps) {
  const { password, setPassword, pwdChanged, setPwdChanged, passwordError } =
    props;
  // State to control whether password is shown or hidden
  const [isPwdHidden, setIsPwdHidden] = useState(true);

  return (
    <>
      <fieldset className="pt-5" aria-labelledby="password-label">
        <label
          id="password-label"
          htmlFor="password-input"
          className="block mb-2 text-mono-primary"
        >
          Password
        </label>
        <div className="relative">
          {/* Input field for password with visibility toggle */}
          <input
            id="password-input"
            type={isPwdHidden ? "password" : "text"}
            placeholder={props.placeholder || "Enter your password"}
            required
            minLength={8}
            maxLength={32}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPwdChanged(true)}
            className={`border-mono-secondary text-mono-primary rounded py-2 px-3 w-full ${pwdChanged ? "invalid:border-alert-primary" : ""} border-2`}
            aria-describedby="password-error"
          />
          <button
            type="button"
            onClick={() => setIsPwdHidden(!isPwdHidden)}
            className="text-sm text-mono-primary hover:underline mt-2 absolute top-1.5 right-3"
            aria-label="Toggle password visibility"
          >
            {isPwdHidden ? <RiEyeOffFill /> : <RiEyeFill />}
          </button>
        </div>
        {/* Display error message if password validation fails */}
        {passwordError != "" && (
          <div
            id="password-error"
            className="text-alert-primary text-center pt-2"
          >
            {passwordError}
          </div>
        )}
      </fieldset>
    </>
  );
}
