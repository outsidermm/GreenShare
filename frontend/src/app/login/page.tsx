"use client";

/**
 * Login page for the GreenShare platform.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import loginUser from "@/services/user/loginUser";
import PasswordInput from "@/components/PasswordInput";
import CredentialsInput from "@/components/CredentialsInput";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorType, setErrorType] = useState("");

  const [emailChanged, setEmailChanged] = useState(false);
  const [pwdChanged, setPwdChanged] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  // Prefetch post-login pages for improved responsiveness
  useEffect(() => {
    router.prefetch("/manage_offers");
    router.prefetch("/manage_products");
  }, [router]);

  /**
   * Handles the login submission process, including authentication,
   * error handling, and redirecting on success.
   */
  const handleSubmit = async () => {
    try {
      const csrf_token = await loginUser(email, password);
      localStorage.setItem("csrfToken", csrf_token);
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
        } else if (err.message.toLowerCase().includes("password")) {
          setErrorType("password");
        } else {
          setErrorType(err.message);
          console.log("Error: ", err.message);
        }
      }
    }
  };

  // Main render structure of the login UI
  return (
    <main
      role="main"
      aria-label="Login Page"
      className="bg-mono-light w-screen h-screen flex items-center justify-center align-middle"
    >
      <div className="sm:max-w-xl shadow-xl rounded-2xl p-6 px-10 sm:min-w-md w-11/12 bg-mono-contrast">
        <h1 className="text-4xl text-center text-mono-primary font-bold">Login</h1>
        {showSuccess && (
          <div
            aria-live="polite"
            className="text-mono-primary text-center mb-2 bg-main-secondary rounded-lg py-2 px-4 mt-5 transition-all"
          >
            Login successful! Redirecting to homepage...
          </div>
        )}
        {!["", "email", "password"].includes(errorType) && (
          <div
            aria-live="polite"
            className="text-mono-primary text-center mb-2 bg-alert-primary rounded-lg py-2 px-4 mt-5 transition-all"
          >
            {errorType}
          </div>
        )}
        <form
          aria-label="Login Form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="p-5 mt-5"
        >
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
            credentialError={
              errorType === "email" ? "Email does not exist" : ""
            }
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
              aria-label="Submit Login"
              className="w-full rounded bg-hyperlink-light hover:bg-hyperlink-secondary text-mono-primary font-bold py-2 px-4 border-solid border-2 border-hyperlink-primary transition-all"
            >
              Login
            </button>
          </div>
          <div className="pt-5 text-center text-mono-secondary">
            <p>
              Don&apos;t have an account?&nbsp;
              <Link
                href="/register"
                className="text-hyperlink-primary hover:text-hyperlink-secondary"
                prefetch={true}
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
