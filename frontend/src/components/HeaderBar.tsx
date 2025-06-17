"use client";
import searchItem from "@/services/api/searchItem";
import { toTitleCase } from "@/utils/titleCase";
import { useState, useEffect } from "react";
import useDebounce from "@/hooks/useDebounce";
import { ImCross } from "react-icons/im";
import { FaSun, FaMoon, FaEyeDropper } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [theme, setTheme] = useState<"light" | "dark" | "color-blind">("light");

  useEffect(() => {
    const currentTheme = document.body.classList.contains("color-blind")
      ? "color-blind"
      : document.body.classList.contains("dark")
        ? "dark"
        : "light";
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const next =
      theme === "light" ? "dark" : theme === "dark" ? "color-blind" : "light";
    setTheme(next);
    document.body.classList.remove("light", "dark", "color-blind");
    document.body.classList.add(next);
  };

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
      <div className="text-lg font-bold text-action-primary">
        <Link href="/">GreenShare</Link>
      </div>
      <div className="flex items-center gap-4 flex-grow px-4 relative">
        <input
          type="text"
          placeholder="Search for items"
          className="flex-grow px-3 py-2 rounded-xl border border-surface focus:border-action-secondary outline-none placeholder-surface bg-inherit text-surface"
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value.length === 0 && handleTitleFilter) {
              handleTitleFilter("");
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (handleTitleFilter) {
                handleTitleFilter(searchTerm);
              } else {
                swal("Redirecting to home page", {
                  icon: "info",
                  timer: 750,
                });
                setSearchTerm("");
                router.push("/");
              }
            }
          }}
          value={searchTerm}
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              if (handleTitleFilter) {
                handleTitleFilter("");
              }
            }}
            className="absolute right-24 px-3 text-xs"
          >
            <ImCross className="text-surface" />
          </button>
        )}
        <button
          onClick={() => {
            if (handleTitleFilter) {
              handleTitleFilter(searchTerm);
            } else {
              swal("Redirecting to home page", {
                icon: "info",
                timer: 750,
              });
              setSearchTerm("");
              router.push("/");
            }
          }}
          className="absolute right-4 text-surface bg-action-primary hover:bg-action-secondary px-3 py-2 rounded-r-xl"
        >
          Enter
        </button>

        {options && options.length > 0 && (
          <div
            className="absolute top-10 flex-grow left-4 bg-surface border shadow-xl rounded-xl"
            style={{ width: "calc(100% - 2rem)" }}
          >
            {options.map((option, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-selected-highlight cursor-pointer text-content hover:font-semibold"
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
      <div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-xl bg-action-primary hover:bg-action-secondary transition-all"
          title={`Current theme: ${theme}`}
        >
          {theme === "light" && <FaSun />}
          {theme === "dark" && <FaMoon />}
          {theme === "color-blind" && <FaEyeDropper />}
        </button>
      </div>

      {!isAuthenticated && (
        <div className="px-4">
          <button
            onClick={handleLogin}
            className="text-action-primary border border-surface px-3 py-1 rounded hover:bg-action-hover"
          >
            Login
          </button>
        </div>
      )}
    </>
  );
}
