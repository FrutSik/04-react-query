import { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";
import type { Movie } from "../../types/movie";
import { fetchMovies } from "../../services/movieService";
import styles from "./App.module.css";

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const prevSearchQueryRef = useRef<string>("");

  const {
    data: moviesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["movies", searchQuery, page],
    queryFn: () => fetchMovies(searchQuery, page),
    enabled: searchQuery !== "",
    staleTime: 5 * 60 * 1000,
    retry: 2,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (
      moviesData &&
      moviesData.results.length === 0 &&
      searchQuery !== "" &&
      !isLoading &&
      prevSearchQueryRef.current !== searchQuery
    ) {
      toast.error("No movies found for your request.");
      prevSearchQueryRef.current = searchQuery;
    }
  }, [moviesData, searchQuery, isLoading]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  const handlePageChange = ({ selected }: { selected: number }) => {
    setPage(selected + 1);
  };

  const showPagination =
    moviesData && moviesData.total_pages > 1 && moviesData.results.length > 0;

  return (
    <div className={styles.app}>
      <SearchBar onSubmit={handleSearch} />

      <main className={styles.main}>
        {isLoading && <Loader />}

        {isError && <ErrorMessage />}

        {!isLoading &&
          !isError &&
          moviesData &&
          moviesData.results.length > 0 && (
            <>
              {showPagination && (
                <ReactPaginate
                  pageCount={Math.min(moviesData.total_pages, 500)}
                  pageRangeDisplayed={5}
                  marginPagesDisplayed={1}
                  onPageChange={handlePageChange}
                  forcePage={page - 1}
                  containerClassName={styles.pagination}
                  activeClassName={styles.active}
                  nextLabel="→"
                  previousLabel="←"
                />
              )}

              <MovieGrid
                movies={moviesData.results}
                onSelect={handleMovieSelect}
              />
            </>
          )}
      </main>

      <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </div>
  );
};

export default App;
