"use client";

/**
 * Login page for the GreenShare platform.
 */

import { useEffect, useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import { useRouter, useSearchParams } from "next/navigation";
import resetPwd from "@/services/user/resetPwd";
import { extractErrorMessage } from "@/utils/extractErrorMsg";
import swal from "sweetalert";


export default function ResetPwdPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [pwdChanged, setPwdChanged] = useState(false);


  // Prefetch post-login pages for improved responsiveness
  useEffect(() => {
    router.prefetch("/login");
    router.prefetch("/register");
  }, [router]);

  /**
   * Handles the login submission process, including authentication,
   * error handling, and redirecting on success.
   */
  const handleSubmit = async () => {
    try {
      if (!token) {
        swal("Error", "Invalid or missing token.", "error");
        return;
      }
      await resetPwd(token, password)
      setPassword("");
      setPwdChanged(false);
      swal("Success!", "Your password has been resetted.", "success");
      setTimeout(() => {
        router.replace("/login");
      }, 500);
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
      aria-label="Reset Password Page Page"
      className="bg-mono-light w-screen h-screen flex items-center justify-center align-middle"
    >
      <div className="sm:max-w-xl shadow-xl rounded-2xl p-6 px-10 sm:min-w-md w-11/12 bg-mono-contrast">
        <h1 className="text-4xl text-center text-mono-primary font-bold">Reset Password</h1>
        <p className = "text-center text-mono-primary">
          Enter your new password below to reset your password.
        </p>
        <form
          aria-label="Reset Password Form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="p-5 mt-5"
        >
          <PasswordInput
            password={password}
            setPassword={setPassword}
            pwdChanged={pwdChanged}
            setPwdChanged={setPwdChanged}
            passwordError=""
            placeholder="Enter your new password"
          />
          <div className="pt-10">
            <button
              type="submit"
              aria-label="Submit New Password"
              className="w-full rounded bg-hyperlink-light hover:bg-hyperlink-secondary text-mono-primary font-bold py-2 px-4 border-solid border-2 border-hyperlink-primary transition-all"
            >
              Change
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
