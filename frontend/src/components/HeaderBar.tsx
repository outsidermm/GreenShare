"use client";
import searchItem from "@/services/api/searchItem";
import { toTitleCase } from "@/utils/titleCase";
import { useState, useEffect } from "react";

interface HeaderBarProps {
  isAuthenticated: boolean;
  handleLogin: () => void;
}

export default function HeaderBar(HeaderBarProps: HeaderBarProps) {
  const { isAuthenticated, handleLogin } = HeaderBarProps;
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      if (searchTerm.length < 3) {
        setOptions([]);
        return;
      }

      try {
        const predictions = await searchItem(searchTerm);
        const newOptions = predictions.predictions;
        setOptions(newOptions);
      } catch (error) {
        console.error("Error fetching items:", error);
        setOptions([]);
      }
    };

    const timer = setTimeout(() => {
      fetchOptions();
    }, 150); // Debounce to avoid too many API calls

    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  return (
    <>
      <div className="text-lg font-bold text-green-600">GreenShare</div>
      <div className="flex items-center gap-4 flex-grow px-4 relative">
        <input
          type="text"
          placeholder="Search for items"
          className="flex-grow px-3 py-2 rounded-xl border border-white focus:border-green-500 outline-none placeholder-white bg-inherit text-sm"
          onChange={(e)=> setSearchTerm(e.target.value)}
        />
        {options && options.length > 0 && (
          <div className="absolute top-10 flex-grow left-4 bg-white border shadow-xl rounded-xl" style={{ width: "calc(100% - 2rem)" }}>
            {options.map((option, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-green-100 cursor-pointer text-slate-800 hover:font-semibold"
                onClick={() => {
                  setSearchTerm(option);
                }}
              >
                {toTitleCase(option)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-6 pr-4">
        {isAuthenticated ? (
          <button className="text-sm">Profile</button>
        ) : (
          <button
            onClick={handleLogin}
            className="text-sm text-green-700 border px-3 py-1 rounded hover:bg-green-50"
          >
            Login
          </button>
        )}
      </div>
    </>
  );
}
