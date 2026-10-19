import { useEffect, useState } from "react";

interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
}

/**
 * Tiny data-loading hook for the mock phase. Ignores results that arrive
 * after the component unmounted or the deps changed (cleanup flag), so
 * stale responses never overwrite fresh state.
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[],
): AsyncState<T> & {
  setData: (updater: (prev: T | undefined) => T | undefined) => void;
} {
  const [state, setState] = useState<AsyncState<T>>({
    data: undefined,
    loading: true,
    error: undefined,
  });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));

    loader()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: undefined });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: undefined,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, deps);

  const setData = (updater: (prev: T | undefined) => T | undefined) =>
    setState((prev) => ({ ...prev, data: updater(prev.data) }));

  return { ...state, setData };
}
