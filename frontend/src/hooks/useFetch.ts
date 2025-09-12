import { useState, useEffect } from "react";
import axiosInstance from "../lib/axiosInstance";
import type { AxiosRequestConfig } from "axios";
export const useFetch = (config : AxiosRequestConfig) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance({
          ...config,
        });
        setData(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
export default useFetch;