import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../../api/client";

export default function Header() {
  const location = useLocation();
  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 30_000,
  });

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/collections", label: "Collections" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-semibold text-lg text-gray-900">
              Tool Misuse Detector
            </Link>
            <nav className="flex gap-1">
              {links.map((link) => {
                const active = location.pathname === link.to ||
                  (link.to !== "/" && location.pathname.startsWith(link.to));
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                health?.status === "ok" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {health?.status === "ok" ? "API Connected" : "API Offline"}
          </div>
        </div>
      </div>
    </header>
  );
}
