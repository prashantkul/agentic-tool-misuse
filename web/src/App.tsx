import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Collections from "./pages/Collections";
import CollectionResults from "./pages/CollectionResults";
import TraceDetailPage from "./pages/TraceDetailPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collections/:id" element={<CollectionResults />} />
              <Route path="/traces/:traceId" element={<TraceDetailPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
