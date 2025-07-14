"use client";

interface CredentialsInputProps {
  type: string;
  placeholder: string;
  minLength: number;
  maxLength: number;
  required: boolean;
  credential: string;
  setCredential: (credential: string) => void;
  credentialChanged: boolean;
  setCredentialChanged: (changed: boolean) => void;
  credentialError: string;
  label: string;
}

// CredentialsInput is a reusable controlled input component for user credentials (e.g. email, password)
export default function CredentialsInput(props: CredentialsInputProps) {
  const {
    type,
    placeholder,
    minLength,
    maxLength,
    required,
    credential,
    setCredential,
    credentialChanged,
    setCredentialChanged,
    credentialError,
    label,
  } = props;

  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <>
      <div className="pt-5">
        {/* Label for the input field, improves accessibility and usability */}
        <label htmlFor={inputId} className="block mb-2 text-mono-primary">
          {label}
        </label>
        {/* Input field bound to parent component's state with dynamic validation styling */}
        <input
          id={inputId}
          aria-describedby={inputId + "-error"}
          type={type}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
          required={required}
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          onFocus={() => setCredentialChanged(true)}
          className={`h-12 border-mono-secondary text-mono-primary rounded py-2 px-3 w-full ${credentialChanged ? "invalid:border-alert-primary" : ""} border-2`}
        />
        {credentialError != "" && (
          <div
            id={inputId + "-error"}
            className="text-alert-primary text-center pt-2"
          >
            {credentialError}
          </div>
        )}
      </div>
    </>
  );
}
