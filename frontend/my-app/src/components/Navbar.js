"use client";
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Zap, LogOut, LayoutDashboard, User, ChevronRight, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("accesstoken");
    
    try {
      const res = await fetch("http://localhost:4000/api/v1/users/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok || res.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("accesstoken");
        logout();
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed", err);
      logout();
      router.push("/login");
    }
  };

  return (
    <nav className="flex justify-between items-center px-4 md:px-6 py-2.5 bg-white/75 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-[100] transition-all shadow-xs">
      {/* --- Brand Logo --- */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="relative w-9 h-9 bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
          <Zap className="text-white fill-white transition-transform group-hover:scale-110" size={18} />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
            <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-black tracking-tighter text-slate-900 uppercase flex items-center gap-1 leading-tight">
            FlowAI <Sparkles size={12} className="text-amber-500 fill-amber-500 animate-bounce" />
          </span>
          <span className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase leading-tight">Neural Core</span>
        </div>
      </Link>
      
      {/* --- Navigation Links --- */}
      <div className="flex items-center gap-2.5">
        {isLoggedIn ? (
          <div className="flex items-center gap-2.5">
            {/* Dashboard Link */}
            {pathname !== "/workflows" && (
              <Link 
                href="/dashboard" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 border border-transparent hover:border-blue-100 transition-all duration-200"
              >
                <LayoutDashboard size={15} className="text-slate-500 group-hover:text-blue-600" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* Profile Pill */}
            <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/80 shadow-inner">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <User size={12} className="text-white" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 tracking-tight">Active Node</span>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-red-500/20 active:scale-95 cursor-pointer group"
            >
              <LogOut size={14} className="transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <Link 
              href="/login" 
              className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-all"
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shadow-md shadow-blue-500/20 active:scale-95 group"
            >
              <span>Get Started</span>
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;