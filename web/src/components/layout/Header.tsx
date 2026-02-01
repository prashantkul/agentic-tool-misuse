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
    <header className="gradient-header sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <span className="text-3xl text-white tracking-wider drop-shadow-md" style={{ fontFamily: "'Audiowide', cursive" }}>
                ToolWatch
              </span>
            </Link>
            <nav className="flex gap-1">
              {links.map((link) => {
                const active = location.pathname === link.to ||
                  (link.to !== "/" && location.pathname.startsWith(link.to));
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-5 py-2 rounded-lg text-[15px] transition-all ${
                      active
                        ? "bg-white/25 text-white shadow-sm font-semibold"
                        : "text-white/80 hover:text-white hover:bg-white/15 font-medium"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[15px] font-medium ${
              health?.status === "ok"
                ? "bg-white/20 text-white"
                : "bg-red-500/30 text-white"
            }`}>
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  health?.status === "ok" ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-red-400"
                }`}
              />
              {health?.status === "ok" ? "API Connected" : "API Offline"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
