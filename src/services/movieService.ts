import axios from "axios";
import type { MoviesResponse } from "../types/movie";

const BASE_URL = "https://api.themoviedb.org/3";
const API_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

if (!API_TOKEN) {
  throw new Error("VITE_TMDB_TOKEN is not defined in environment variables");
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
  },
});

export const fetchMovies = async (
  query: string,
  page: number = 1
): Promise<MoviesResponse> => {
  try {
    const response = await axiosInstance.get<MoviesResponse>("/search/movie", {
      params: {
        query,
        page,
        include_adult: false,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch movies: ${error.message}`);
    } else {
      throw new Error("Failed to fetch movies: Unknown error occurred");
    }
  }
};
