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

// HeaderBar component displays the main navigation area, including site title, search input, theme toggle, and login button
export default function HeaderBar(HeaderBarProps: HeaderBarProps) {
  const { isAuthenticated, handleLogin, handleTitleFilter } = HeaderBarProps;
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 150);
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark" | "color-blind">("light");

  // Detect and set current theme on component mount by checking body class
  useEffect(() => {
    const currentTheme = document.body.classList.contains("color-blind")
      ? "color-blind"
      : document.body.classList.contains("dark")
        ? "dark"
        : "light";
    setTheme(currentTheme);
  }, []);

  // Cycle through light, dark, and color-blind themes and update the body class
  const toggleTheme = () => {
    const next =
      theme === "light" ? "dark" : theme === "dark" ? "color-blind" : "light";
    setTheme(next);
    document.body.classList.remove("light", "dark", "color-blind");
    document.body.classList.add(next);
  };

  // Fetch search suggestions when the debounced search term changes
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
      <div
        role="heading"
        aria-level={1}
        className="text-lg font-bold text-main-primary"
      >
        <Link href="/">GreenShare</Link>
      </div>
      <nav
        role="navigation"
        aria-label="Site-wide navigation"
        className="flex items-center gap-4 flex-grow px-4 relative ml-20"
      >
        {/* Text input for searching item titles */}
        <input
          type="text"
          placeholder="Search for items"
          className="flex-grow px-3 py-2 rounded-xl border border-mono-secondary focus:border-main-secondary outline-none placeholder-mono-primary bg-mono-light text-mono-primary"
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
                });
                setSearchTerm("");
                router.push("/");
              }
            }
          }}
          value={searchTerm}
          aria-label="Search for items"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              if (handleTitleFilter) {
                handleTitleFilter("");
              }
            }}
            className="absolute right-24 px-3 text-xs text-mono-primary"
          >
            <ImCross />
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
          className="absolute bg-main-ascent hover:bg-main-secondary active:bg-main-primary border border-main-primary px-3 py-2 rounded-r-xl text-mono-primary transition-all"
          style={{ right: "1.04rem"}}
        >
          Search
        </button>

        {/* Render list of search suggestions below input if available */}
        {options && options.length > 0 && (
          <div
            className="absolute top-10 flex-grow left-4 bg-mono-light border shadow-xl rounded-xl"
            style={{ width: "calc(100% - 2rem)" }}
          >
            {options.map((option, index) => (
              <div
                key={index}
                className="px-3 py-2 cursor-pointer text-mono-primary hover:font-semibold"
                onClick={() => {
                  setSearchTerm(option);
                }}
              >
                {toTitleCase(option)}
              </div>
            ))}
          </div>
        )}
      </nav>
      <div>
        {/* Button to toggle between visual themes with accessible icon and label */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-xl bg-main-ascent hover:bg-main-secondary active:bg-main-primary border border-main-primary transition-all"
          title={`Current theme: ${theme}`}
          aria-label="Toggle visual theme"
        >
          {theme === "light" && <FaSun />}
          {theme === "dark" && <FaMoon />}
          {theme === "color-blind" && <FaEyeDropper />}
        </button>
      </div>

      {/* Show login button only if user is not authenticated */}
      {!isAuthenticated && (
        <div className="px-4">
          <button
            onClick={handleLogin}
            className="text-mono-primary bg-main-ascent hover:bg-main-secondary active:bg-main-primary border border-main-primary px-3 py-1 rounded transition-all"
            aria-label="Login to GreenShare"
          >
            Login
          </button>
        </div>
      )}
    </>
  );
}
