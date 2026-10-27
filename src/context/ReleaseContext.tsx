import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchReleaseIndex, Release, ReleaseIndex } from '../data/catalog';

interface ReleaseState {
  index: ReleaseIndex | null;
  release: Release | null;
  previous: Release | null;
  isCurrent: boolean;
  setRelease: (id: string) => void;
  error: string | null;
}

const ReleaseContext = createContext<ReleaseState | null>(null);

// The selected release lives in the URL (?release=2025.10) so views can be shared;
// without the parameter the site shows the current release.
export const ReleaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [index, setIndex] = useState<ReleaseIndex | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    fetchReleaseIndex()
      .then(setIndex)
      .catch((e) => setError(String(e.message || e)));
  }, []);

  const value = useMemo<ReleaseState>(() => {
    const requested = params.get('release');
    const release =
      index?.releases.find((r) => r.id === requested) ||
      index?.releases.find((r) => r.id === index.current) ||
      null;
    return {
      index,
      release,
      previous: release?.previous ? index?.releases.find((r) => r.id === release.previous) || null : null,
      isCurrent: !!release && release.id === index?.current,
      error,
      setRelease: (id: string) => {
        const next = new URLSearchParams(params);
        if (id === index?.current) next.delete('release');
        else next.set('release', id);
        setParams(next, { replace: true });
      },
    };
  }, [index, params, setParams, error]);

  return <ReleaseContext.Provider value={value}>{children}</ReleaseContext.Provider>;
};

export function useRelease(): ReleaseState {
  const ctx = useContext(ReleaseContext);
  if (!ctx) throw new Error('useRelease must be used inside ReleaseProvider');
  return ctx;
}

// Keep ?release= when linking between pages
export function useReleaseLink() {
  const [params] = useSearchParams();
  const release = params.get('release');
  return (path: string) => (release ? `${path}${path.includes('?') ? '&' : '?'}release=${release}` : path);
}
