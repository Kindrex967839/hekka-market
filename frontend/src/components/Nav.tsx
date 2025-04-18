import React, { startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser, SignOutButton } from "@clerk/clerk-react";

export function Nav() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  return (
    <nav className="bg-[#ff3b9a] py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between">
        {/* Logo */}
        <div
          className="text-3xl font-extrabold tracking-tighter cursor-pointer flex items-center"
          onClick={() => navigate("/")}
        >
          <span className="bg-yellow-400 text-black px-3 py-1 rounded-md mr-2">HEKKA</span>
          <span className="text-white">MARKET</span>
        </div>

        {/* Main Navigation */}
        <div className="hidden md:flex space-x-1">
          <NavLink href="/" label="Home" />
          <NavLink href="/explore" label="Explore" />
          <NavLink href="/categories" label="Categories" />
          <NavLink href="/selling" label="Start Selling" highlight />
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoaded && isSignedIn ? (
            <div className="flex items-center space-x-4">
              <div className="text-white font-semibold">
                Hello, {user?.firstName || user?.username || 'User'}
              </div>
              <SignOutButton>
                <button className="bg-white text-[#ff3b9a] font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  startTransition(() => {
                    navigate('/sign-in');
                  });
                }}
                className="bg-white text-[#ff3b9a] font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  startTransition(() => {
                    navigate('/sign-up');
                  });
                }}
                className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button className="text-white text-2xl p-2">
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
  highlight?: boolean;
}

function NavLink({ href, label, highlight = false }: NavLinkProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        startTransition(() => {
          navigate(href);
        });
      }}
      className={`px-4 py-2 font-semibold rounded-lg ${highlight
        ? 'bg-yellow-400 text-black'
        : 'text-white hover:bg-white hover:bg-opacity-20'}
        transition-all`}
    >
      {label}
    </button>
  );
}
