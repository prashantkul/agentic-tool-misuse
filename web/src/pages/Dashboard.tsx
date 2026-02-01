import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getStats } from "../api/client";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import MetricsCards from "../components/dashboard/MetricsCards";
import DecisionChart from "../components/dashboard/DecisionChart";
import CategoryChart from "../components/dashboard/CategoryChart";
import RecentAnalyses from "../components/dashboard/RecentAnalyses";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  if (isLoading) return <LoadingSpinner />;

  if (!stats || stats.total_traces === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          No data yet
        </h2>
        <p className="text-gray-500 mb-6">
          Analyze a collection to see results here.
        </p>
        <Link
          to="/collections"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="gradient-hero rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Audiowide', cursive" }}>Tool Misuse Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Monitor and analyze agent tool call patterns for security threats.
        </p>
      </div>
      <MetricsCards stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DecisionChart decisions={stats.decisions} />
        <CategoryChart categories={stats.categories} />
      </div>
      <RecentAnalyses analyses={stats.recent_analyses} />
    </div>
  );
}
