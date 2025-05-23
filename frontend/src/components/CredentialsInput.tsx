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

  return (
    <>
      <div className="pt-5">
        <label className="block mb-2 text-slate-800">{label}</label>
        <input
          type={type}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
          required={required}
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          onFocus={() => setCredentialChanged(true)}
          className={`border-slate-500 text-slate-500 rounded py-2 px-3 w-full ${credentialChanged ? "invalid:border-red-500" : ""} border-2`}
        />
        {credentialError != "" && (
          <div className="text-red-500 text-sm text-center pt-2">
            {credentialError}
          </div>
        )}
      </div>
    </>
  );
}
