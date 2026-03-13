import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Film, LogIn, LogOut, Menu, User, X } from 'lucide-react';
import loginService from '../services/login';
import serviceUtils from '../services/utils';
import type { LoggedUser } from '../types';
import logo from '../assets/tmdb-logo.svg';
import { AppSessionContext } from '../context/AppSessionContext';

const LOGGED_USER_STORAGE_KEY = 'loggedCinemaTreasuresUser';

const isLoggedUser = (value: unknown): value is LoggedUser => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybeUser = value as Partial<LoggedUser>;
  return (
    typeof maybeUser.name === 'string' &&
    typeof maybeUser.username === 'string' &&
    typeof maybeUser.token === 'string'
  );
};

const getLoginErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { error?: unknown } } }).response;
    if (typeof response?.data?.error === 'string') {
      return response.data.error;
    }
  }

  return 'Invalid username or password';
};

export function AppLayout() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<LoggedUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  useEffect(() => {
    const storedUser = window.localStorage.getItem(LOGGED_USER_STORAGE_KEY);
    if (!storedUser) {
      return;
    }

    try {
      const parsedUser: unknown = JSON.parse(storedUser);
      if (isLoggedUser(parsedUser)) {
        serviceUtils.setToken(parsedUser.token);
        setCurrentUser(parsedUser);
      } else {
        serviceUtils.setToken(null);
        window.localStorage.removeItem(LOGGED_USER_STORAGE_KEY);
      }
    } catch {
      serviceUtils.setToken(null);
      window.localStorage.removeItem(LOGGED_USER_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    serviceUtils.setToken(currentUser?.token ?? null);
  }, [currentUser]);

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setPassword('');
    setErrorMessage(null);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    serviceUtils.setToken(null);
    setIsProfileMenuOpen(false);
    window.localStorage.removeItem(LOGGED_USER_STORAGE_KEY);
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const loggedUser = await loginService.login({
        username: username.trim(),
        password,
      });
      serviceUtils.setToken(loggedUser.token);
      setCurrentUser(loggedUser);
      window.localStorage.setItem(LOGGED_USER_STORAGE_KEY, JSON.stringify(loggedUser));
      setUsername('');
      setPassword('');
      setErrorMessage(null);
      setIsLoginModalOpen(false);
    } catch (error: unknown) {
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    title={`Signed in as ${currentUser.name}`}
                  >
                    {currentUser.name.charAt(0).toUpperCase()}
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[var(--color-cinema-dark)] border border-[var(--color-cinema-gray)] rounded-xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-[var(--color-cinema-gray)] mb-2">
                        <p className="text-xs text-[var(--color-silver-500)] uppercase tracking-wider font-semibold">Signed in as</p>
                        <p className="text-sm text-[var(--color-gold-400)] font-serif mt-1">{currentUser.name}</p>
                        <p className="text-xs text-[var(--color-silver-500)] mt-1">@{currentUser.username}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
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
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm" onClick={closeLoginModal}>
            <div className="flex min-h-[100dvh] items-start justify-center px-4 py-6 sm:items-center sm:py-8">
              <div
                className="relative w-full max-w-sm max-h-[calc(100dvh-3rem)] overflow-y-auto bg-[var(--color-cinema-dark)] border border-[var(--color-gold-600)]/30 rounded-2xl shadow-2xl p-4 sm:max-h-[calc(100dvh-5rem)] sm:p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-cinema-gray)] text-[var(--color-silver-400)] hover:text-[var(--color-gold-400)] hover:border-[var(--color-gold-600)] transition-colors"
                  aria-label="Close login modal"
                >
                  <X size={16} />
                </button>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-cinema-gray)] flex items-center justify-center text-[var(--color-gold-400)]">
                    <User size={24} />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-[var(--color-gold-400)] mb-4 sm:mb-6 text-center">Member Login</h2>
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="username" className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all"
                      autoComplete="username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-xs font-semibold text-[var(--color-silver-400)] uppercase tracking-wider">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full bg-[var(--color-cinema-black)] border border-[var(--color-cinema-gray)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-gold-500)] focus:ring-1 focus:ring-[var(--color-gold-500)] transition-all"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  {errorMessage && (
                    <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {errorMessage}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-lg bg-[var(--color-gold-500)] text-black font-semibold hover:bg-[var(--color-gold-400)] disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
                <button
                  onClick={closeLoginModal}
                  className="w-full mt-4 pb-1 py-2 text-[var(--color-silver-500)] hover:text-white transition-colors text-sm font-medium"
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
