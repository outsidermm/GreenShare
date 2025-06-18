"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import registerUser from "@/services/user/registerUser";
import PasswordInput from "@/components/PasswordInput";
import CredentialsInput from "@/components/CredentialsInput";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  // State variables for user registration form and error handling
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [firstNameChanged, setFirstNameChanged] = useState(false);
  const [lastNameChanged, setLastNameChanged] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const [pwdChanged, setPwdChanged] = useState(false);

  const [errorType, setErrorType] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Prefetches pages for smoother post-registration navigation
  useEffect(() => {
    router.prefetch("/manage_offers");
    router.prefetch("/manage_products");
  }, [router]);

  const handleSubmit = async () => {
    try {
      const csrf_token = await registerUser({
        email,
        password,
        firstName,
        lastName,
      });
      localStorage.setItem("csrfToken", csrf_token);
      setPassword("");
      setEmail("");
      setFirstName("");
      setLastName("");

      setFirstNameChanged(false);
      setLastNameChanged(false);
      setEmailChanged(false);
      setPwdChanged(false);

      setErrorType("");

      setShowSuccess(true);
      setTimeout(() => {
        router.replace("/");
      }, 500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes("exist")) {
          setErrorType("email-exists");
        } else if (err.message.toLowerCase().includes("email")) {
          setErrorType("email");
        } else if (err.message.toLowerCase().includes("first name")) {
          setErrorType("first name");
        } else if (err.message.toLowerCase().includes("last name")) {
          setErrorType("last name");
        } else if (err.message.toLowerCase().includes("password")) {
          setErrorType("password");
        } else {
          setErrorType(err.message);
          console.log("Error: ", err.message);
        }
      }
    }
  };

  return (
    <main className="bg-background w-screen h-screen flex items-center justify-center align-middle" role="main" aria-label="Registration Page">
      <div className="sm:max-w-xl shadow-grey-shadow shadow-xl rounded-2xl p-6 px-10 sm:min-w-md w-11/12 bg-surface">
        <header>
          <h1 className="text-4xl text-center text-content font-bold">
            Registration
          </h1>
        </header>
        {showSuccess && (
          <div aria-live="polite" className="text-surface text-center mb-2 bg-action-primary rounded-lg py-2 px-4 mt-5 transition-all">
            Registration successful! Redirecting to homepage...
          </div>
        )}
        {![
          "",
          "email",
          "password",
          "first name",
          "last name",
          "email-exists",
        ].includes(errorType) && (
          <div aria-live="polite" className="text-surface text-center mb-2 bg-alert rounded-lg py-2 px-4 mt-5 transition-all">
            {errorType}
          </div>
        )}
        {/* Form for capturing user's first name, last name, email, and password */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="p-5 mt-5"
        >
          <CredentialsInput
            type="text"
            placeholder="Enter your first name"
            minLength={2}
            maxLength={50}
            required
            credential={firstName}
            setCredential={setFirstName}
            credentialChanged={firstNameChanged}
            setCredentialChanged={setFirstNameChanged}
            credentialError={
              errorType === "first name"
                ? "First name must be 2-50 characters long and only include letters, spaces, hyphens, apostrophes, and periods"
                : ""
            }
            label="First Name"
          />
          <CredentialsInput
            type="text"
            placeholder="Enter your last name"
            minLength={2}
            maxLength={50}
            required
            credential={lastName}
            setCredential={setLastName}
            credentialChanged={lastNameChanged}
            setCredentialChanged={setLastNameChanged}
            credentialError={
              errorType === "last name"
                ? "Last name must be 2-50 characters long and only include letters, spaces, hyphens, apostrophes, and periods"
                : ""
            }
            label="Last Name"
          />
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
              errorType === "email-exists"
                ? "Email already exists"
                : errorType === "email"
                  ? "Email must start with letters or numbers, include @ and a valid domain, have a 2-8 character extension, and be 3-320 characters long."
                  : ""
            }
            label="Email Address"
          />
          <PasswordInput
            password={password}
            setPassword={setPassword}
            pwdChanged={pwdChanged}
            setPwdChanged={setPwdChanged}
            passwordError={
              errorType === "password"
                ? "Password must be 8-32 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character"
                : ""
            }
          />
          {/* User agreement to terms of service */}
          <div className="py-5">
            <label
              htmlFor="agreement-box"
              className="inline-flex items-center text-content"
            >
              <input
                type="checkbox"
                id="agreement-box"
                value="yes"
                className="mr-2"
                required
              />
              I agree to the terms of service.
            </label>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded bg-hyperlink hover:bg-hyperlink-hover text-surface font-bold py-2 px-4 border-solid border-2 border-hyperlink transition-all"
            >
              Create an Account
            </button>
          </div>
          {/* Link to the login page for users who already have an account */}
          <div className="pt-5 text-center text-slate-500">
            <p>
              Already have an account?&nbsp;
              <Link
                href="/login"
                className="text-hyperlink hover:text-hyperlink-hover"
                prefetch={true}
              >
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
