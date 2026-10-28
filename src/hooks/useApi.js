import { useState, useEffect, useCallback } from "react";

export function useApi(apiFunction, immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    if (!immediate) return undefined;
    let activo = true;
    (async () => {
      try {
        const result = await apiFunction();
        if (activo) setData(result);
      } catch (err) {
        if (activo) setError(err.message || "Error desconocido");
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [apiFunction, immediate]);

  return { data, loading, error, execute, setData };
}

export function useFetch(apiFunction, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Las dependencias se comparan por valor serializado: la firma original
  // acepta un array dinámico y el linter no puede verificarlo estáticamente.
  const depsKey = JSON.stringify(deps);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const result = await apiFunction();
        if (activo) setData(result);
      } catch (err) {
        if (activo) setError(err.message || "Error desconocido");
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [apiFunction, depsKey]);

  return { data, loading, error, refetch: fetchData, setData };
}
