"use client";
import searchItem from "@/services/api/searchItem";
import { toTitleCase } from "@/utils/titleCase";
import { useState, useEffect } from "react";
import useDebounce from "@/hooks/useDebounce";
import { ImCross } from "react-icons/im";
import { useRouter } from "next/navigation";

interface HeaderBarProps {
  isAuthenticated: boolean;
  handleLogin: () => void;
  handleTitleFilter?: (title: string) => void;
}

export default function HeaderBar(HeaderBarProps: HeaderBarProps) {
  const { isAuthenticated, handleLogin, handleTitleFilter } = HeaderBarProps;
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 150);
  const router = useRouter();

  useEffect(() => {
    const fetchOptions = async () => {
      if (debouncedSearchTerm.length < 3) {
        setOptions([]);
        return;
      }

      try {
        const predictions = await searchItem(debouncedSearchTerm);
        const newOptions = predictions.predictions;
        setOptions(newOptions);
      } catch (error) {
        console.error("Error fetching items:", error);
        setOptions([]);
      }
    };

    fetchOptions();
  }, [debouncedSearchTerm]);

  return (
    <>
      <div className="text-lg font-bold text-green-600">GreenShare</div>
      <div className="flex items-center gap-4 flex-grow px-4 pr-10 relative">
        {handleTitleFilter ? (
          <>
            <input
              type="text"
              placeholder="Search for items"
              className="flex-grow px-3 py-2 rounded-xl border border-white focus:border-green-500 outline-none placeholder-white bg-inherit text-sm"
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.length === 0) {
                  handleTitleFilter("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTitleFilter(searchTerm);
                }
              }}
              value={searchTerm}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  handleTitleFilter("");
                }}
                className="absolute right-28 px-3 text-xs"
              >
                <ImCross className="text-white" />
              </button>
            )}
            <button
              onClick={() => handleTitleFilter(searchTerm)}
              className="absolute right-10 text-white text-sm bg-green-600 hover:bg-green-700 px-3 py-2 rounded-r-xl"
            >
              Enter
            </button>

            {options && options.length > 0 && (
              <div
                className="absolute top-10 flex-grow left-4 bg-white border shadow-xl rounded-xl"
                style={{ width: "calc(100% - 2rem)" }}
              >
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
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Search for items"
              className="flex-grow px-3 py-2 rounded-xl border border-white focus:border-green-500 outline-none placeholder-white bg-inherit text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  swal("Redirecting to home page", {
                    icon: "info",
                    timer: 750,
                  });
                  setSearchTerm("");
                  router.push("/");
                }
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => {
                swal("Redirecting to home page", {
                  icon: "info",
                  timer: 750,
                });
                setSearchTerm("");
                router.push("/");
              }}
              className="absolute right-10 text-white text-sm bg-green-600 hover:bg-green-700 px-3 py-2 rounded-r-xl"
            >
              Enter
            </button>
          </>
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
