"use client";

/**
 * Forgot Password page for the GreenShare platform.
 */

import { useEffect, useState } from "react";
import CredentialsInput from "@/components/CredentialsInput";
import { useRouter } from "next/navigation";
import forgotPwd from "@/services/user/forgotPwd";
import { extractErrorMessage } from "@/utils/extractErrorMsg";
import swal from "sweetalert";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailChanged, setEmailChanged] = useState(false);

  // Prefetch post-forget password pages for improved responsiveness
  useEffect(() => {
    router.prefetch("/login");
    router.prefetch("/register");
  }, [router]);

  /**
   * Handles the forget password submission process, including error handling, and redirecting on success.
   */
  const handleSubmit = async () => {
    try {
      await forgotPwd(email);
      swal("Success!", "Please check your email address for a password reset link.", "success");
      setEmail("");
      setEmailChanged(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
          swal("Error", extractErrorMessage(error.message), "error");
      }
    }
  };

  // Main render structure of the login UI
  return (
    <main
      role="main"
      aria-label="Forgot Password Page"
      className="bg-mono-light w-screen h-screen flex items-center justify-center align-middle"
    >
      <div className="sm:max-w-xl shadow-xl rounded-2xl p-6 px-10 sm:min-w-md w-11/12 bg-mono-contrast">
        <h1 className="text-4xl text-center text-mono-primary font-bold">Forgot Password</h1>
        <p className = "text-center text-mono-primary mt-4">
          Enter your email address below to receive a password reset link.
          If you do not receive an email, please check your spam folder.
          If you still do not receive an email, please contact support.
        </p>
        <form
          aria-label="Forgot Password Form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="p-5"
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
            credentialError=""
            label="Email Address"
          />
          <div className="pt-10">
            <button
              type="submit"
              aria-label="Submit Forget Password Form"
              className="w-full rounded bg-hyperlink-light hover:bg-hyperlink-secondary text-mono-primary font-bold py-2 px-4 border-solid border-2 border-hyperlink-primary transition-all"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
