import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const isTreasureTrovePath = (pathname: string) =>
  pathname === '/treasure-trove' || pathname.startsWith('/treasure-trove/');

export function ScrollToTop() {
  const location = useLocation();
  const previousPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    const currentPathname = location.pathname;
    const isTreasureTroveTransition =
      previousPathname !== null &&
      isTreasureTrovePath(previousPathname) &&
      isTreasureTrovePath(currentPathname);

    if (isTreasureTroveTransition) {
      previousPathnameRef.current = currentPathname;
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    previousPathnameRef.current = currentPathname;
  }, [location.pathname]);

  return null;
}
