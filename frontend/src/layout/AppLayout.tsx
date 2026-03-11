import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Film, LogIn, LogOut, Menu, User, X } from 'lucide-react';
import { MEMBERS } from '../data';
import type { Member } from '../types';
import logo from '../assets/tmdb-logo.svg';
import { AppSessionContext } from '../context/AppSessionContext';

export function AppLayout() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const desktopMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target as Node)) {
        setIsDesktopMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDesktopMenuOpen(false);
  }, [location.pathname]);

  const contextValue = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      openLogin: () => setIsLoginModalOpen(true),
    }),
    [currentUser],
  );

  return (
    <AppSessionContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-br from-[#4a313a] via-[#3a3028] to-[#403b2c] text-[var(--color-silver-300)] font-sans selection:bg-[var(--color-gold-500)] selection:text-black flex flex-col">
        <header className="border-b border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-gold-400)] to-[var(--color-gold-600)] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <Film className="text-black" size={20} />
              </div>
              <div className="flex items-center">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-gold-300)] to-[var(--color-gold-600)] tracking-tight leading-none">
                  Cinema Treasures
                </h1>
              </div>
            </Link>

            <div className="flex items-center gap-3 sm:gap-6">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--color-cinema-gray)] text-[var(--color-silver-300)] hover:text-[var(--color-gold-400)] hover:border-[var(--color-gold-600)] transition-colors"
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav-menu"
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <div className="relative hidden sm:block" ref={desktopMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsDesktopMenuOpen((open) => !open)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-cinema-gray)] text-sm font-medium text-[var(--color-silver-300)] hover:text-[var(--color-gold-400)] hover:border-[var(--color-gold-600)] transition-colors"
                  aria-label={isDesktopMenuOpen ? 'Close desktop navigation menu' : 'Open desktop navigation menu'}
                  aria-expanded={isDesktopMenuOpen}
                  aria-controls="desktop-nav-menu"
                >
                  Menu
                  {isDesktopMenuOpen ? <X size={14} /> : <Menu size={14} />}
                </button>
                {isDesktopMenuOpen && (
                  <div
                    id="desktop-nav-menu"
                    className="absolute right-0 mt-2 w-52 bg-[var(--color-cinema-dark)] border border-[var(--color-cinema-gray)] rounded-xl shadow-2xl p-2 z-50"
                  >
                    <nav className="flex flex-col gap-1">
                      <NavLink
                        to="/"
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'text-[var(--color-gold-400)] bg-[var(--color-cinema-gray)]'
                              : 'text-[var(--color-silver-300)] hover:text-[var(--color-gold-400)] hover:bg-[var(--color-cinema-gray)]/70'
                          }`
                        }
                      >
                        Home
                      </NavLink>
                      <NavLink
                        to="/history"
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'text-[var(--color-gold-400)] bg-[var(--color-cinema-gray)]'
                              : 'text-[var(--color-silver-300)] hover:text-[var(--color-gold-400)] hover:bg-[var(--color-cinema-gray)]/70'
                          }`
                        }
                      >
                        Film Log
                      </NavLink>
                      <NavLink
                        to="/treasure-trove"
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'text-[var(--color-gold-400)] bg-[var(--color-cinema-gray)]'
                              : 'text-[var(--color-silver-300)] hover:text-[var(--color-gold-400)] hover:bg-[var(--color-cinema-gray)]/70'
                          }`
                        }
                      >
                        Treasure Trove
                      </NavLink>
                      <NavLink
                        to="/ctcstm-scale"
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'text-[var(--color-gold-400)] bg-[var(--color-cinema-gray)]'
                              : 'text-[var(--color-silver-300)] hover:text-[var(--color-gold-400)] hover:bg-[var(--color-cinema-gray)]/70'
                          }`
                        }
                      >
                        CTCSTM Scale
                      </NavLink>
                      <NavLink
                        to="/awards"
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'text-[var(--color-gold-400)] bg-[var(--color-cinema-gray)]'
                              : 'text-[var(--color-silver-300)] hover:text-[var(--color-gold-400)] hover:bg-[var(--color-cinema-gray)]/70'
                          }`
                        }
                      >
                        Awards
                      </NavLink>
                      <NavLink
                        to="/about"
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'text-[var(--color-gold-400)] bg-[var(--color-cinema-gray)]'
                              : 'text-[var(--color-silver-300)] hover:text-[var(--color-gold-400)] hover:bg-[var(--color-cinema-gray)]/70'
                          }`
                        }
                      >
                        About
                      </NavLink>
                    </nav>
                  </div>
                )}
              </div>
              {currentUser ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-cinema-gray)] border border-[var(--color-gold-600)] text-[var(--color-gold-400)] hover:bg-[var(--color-cinema-dark)] transition-all font-serif font-bold text-lg shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                    title={`Signed in as ${currentUser}`}
                  >
                    {currentUser.charAt(0)}
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[var(--color-cinema-dark)] border border-[var(--color-cinema-gray)] rounded-xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-[var(--color-cinema-gray)] mb-2">
                        <p className="text-xs text-[var(--color-silver-500)] uppercase tracking-wider font-semibold">Signed in as</p>
                        <p className="text-sm text-[var(--color-gold-400)] font-serif mt-1">{currentUser}</p>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentUser(null);
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--color-silver-400)] hover:bg-[var(--color-cinema-gray)] hover:text-white transition-colors flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-cinema-gray)] hover:border-[var(--color-gold-600)] hover:text-[var(--color-gold-400)] transition-all text-sm font-medium"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Member Login</span>
                </button>
              )}
            </div>
          </div>
          {isMobileMenuOpen && (
            <div
              id="mobile-nav-menu"
              className="sm:hidden border-t border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/95 px-4 py-3"
            >
              <nav className="flex flex-col gap-2">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-[var(--color-gold-400)] bg-[var(--color-cinema-gray)]'
                        : 'text-[var(--color-silver-300)] hover:text-[var(--color-gold-400)] hover:bg-[var(--color-cinema-gray)]/70'
                    }`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/history"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-[var(--color-gold-400)] bg-[var(--color-cinema-gray)]'
                        : 'text-[var(--color-silver-300)] hover:text-[var(--color-gold-400)] hover:bg-[var(--color-cinema-gray)]/70'
                    }`
                  }
                >
                  Film Log
                </NavLink>
                <NavLink
                  to="/treasure-trove"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-[var(--color-gold-400)] bg-[var(--color-cinema-gray)]'
                        : 'text-[var(--color-silver-300)] hover:text-[var(--color-gold-400)] hover:bg-[var(--color-cinema-gray)]/70'
                    }`
                  }
                >
                  Treasure Trove
                </NavLink>
                <NavLink
                  to="/ctcstm-scale"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-[var(--color-gold-400)] bg-[var(--color-cinema-gray)]'
                        : 'text-[var(--color-silver-300)] hover:text-[var(--color-gold-400)] hover:bg-[var(--color-cinema-gray)]/70'
                    }`
                  }
                >
                  CTCSTM Scale
                </NavLink>
                <NavLink
                  to="/awards"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-[var(--color-gold-400)] bg-[var(--color-cinema-gray)]'
                        : 'text-[var(--color-silver-300)] hover:text-[var(--color-gold-400)] hover:bg-[var(--color-cinema-gray)]/70'
                    }`
                  }
                >
                  Awards
                </NavLink>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-[var(--color-gold-400)] bg-[var(--color-cinema-gray)]'
                        : 'text-[var(--color-silver-300)] hover:text-[var(--color-gold-400)] hover:bg-[var(--color-cinema-gray)]/70'
                    }`
                  }
                >
                  About
                </NavLink>
              </nav>
            </div>
          )}
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col items-center md:items-start gap-2">
                <p className="text-sm text-[var(--color-silver-500)]">&copy; {new Date().getFullYear()} Cinema Treasures. All rights reserved.</p>
                <div className="flex gap-4 text-sm text-[var(--color-silver-400)]">
                  <a href="#" className="hover:text-[var(--color-gold-400)] transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-[var(--color-gold-400)] transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-[var(--color-gold-400)] transition-colors">Cookie Preferences</a>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-[var(--color-silver-500)] max-w-lg text-left md:text-right">
                <img src={logo} alt="TMDB Logo" className="h-12" referrerPolicy="no-referrer" />
                <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
              </div>
            </div>
          </div>
        </footer>

        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}>
            <div className="flex min-h-full items-center justify-center p-4">
              <div
                className="bg-[var(--color-cinema-dark)] border border-[var(--color-gold-600)]/30 rounded-2xl w-full max-w-sm shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-cinema-gray)] flex items-center justify-center text-[var(--color-gold-400)]">
                    <User size={24} />
                  </div>
                </div>
                <h2 className="text-2xl font-serif text-[var(--color-gold-400)] mb-6 text-center">Select Member</h2>
                <div className="space-y-3">
                  {MEMBERS.map((member) => (
                    <button
                      key={member}
                      onClick={() => {
                        setCurrentUser(member);
                        setIsLoginModalOpen(false);
                      }}
                      className="w-full py-3 rounded-xl border border-[var(--color-cinema-gray)] text-[var(--color-silver-300)] hover:border-[var(--color-gold-500)] hover:text-[var(--color-gold-400)] hover:bg-[var(--color-cinema-gray)]/30 transition-all font-medium text-lg font-serif"
                    >
                      {member}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setIsLoginModalOpen(false)}
                  className="w-full mt-6 py-2 text-[var(--color-silver-500)] hover:text-white transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppSessionContext.Provider>
  );
}
