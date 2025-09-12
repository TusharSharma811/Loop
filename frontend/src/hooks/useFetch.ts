import { useState, useEffect } from "react";
import axiosInstance from "../lib/axiosInstance";
import type { AxiosRequestConfig } from "axios";
export const useFetch = (config : AxiosRequestConfig , body : any) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance({
          ...config,
          data: body
        });
        setData(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [JSON.stringify(config), JSON.stringify(body)]); // Re-fetch if config or body changes

  return { data, loading, error };
};
export default useFetch;