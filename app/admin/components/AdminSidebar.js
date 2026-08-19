"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: "▦",
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: "♟",
  },
  {
    name: "Deposits",
    href: "/admin/deposits",
    icon: "₹",
  },
  {
    name: "Withdrawals",
    href: "/admin/withdraws",
    icon: "↗",
  },
  {
    name: "Games",
    href: "/admin/games",
    icon: "◆",
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: "⚙",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        console.error(
          "Admin logout failed:",
          data?.message || "Unknown error"
        );
        return;
      }

      setOpen(false);

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Admin logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div
      ref={menuRef}
      className="fixed top-4 left-4 z-[9999]"
    >
      {/* MENU BUTTON */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open admin menu"
        aria-expanded={open}
        className="
          w-12 h-12
          rounded-2xl
          bg-slate-950
          text-white
          border border-slate-700
          shadow-xl
          flex items-center justify-center
          text-xl font-bold
          hover:bg-slate-800
          hover:border-blue-500
          transition
        "
      >
        {open ? "×" : "☰"}
      </button>

      {/* MENU */}
      {open && (
        <div
          className="
            absolute
            top-14
            left-0
            w-64
            rounded-2xl
            bg-slate-950
            border border-slate-700
            shadow-2xl
            overflow-hidden
          "
        >
          {/* HEADER */}
          <div className="px-5 py-4 border-b border-slate-800">
            <div className="text-lg font-black text-white">
              CoinFlip Admin
            </div>

            <div className="text-xs text-slate-400 mt-1">
              Administration Panel
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="p-3">
            {menuItems.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`
                    group
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-xl
                    mb-1
                    transition
                    ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >
                  <span
                    className={`
                      w-9 h-9
                      rounded-lg
                      flex items-center justify-center
                      text-lg font-bold
                      ${
                        active
                          ? "bg-white/15"
                          : "bg-slate-800 group-hover:bg-slate-700"
                      }
                    `}
                  >
                    {item.icon}
                  </span>

                  <span className="font-semibold">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* LOGOUT */}
          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="
                w-full
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-xl
                text-red-400
                bg-red-500/10
                border border-red-500/20
                hover:bg-red-500
                hover:text-white
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition
              "
            >
              <span
                className="
                  w-9 h-9
                  rounded-lg
                  bg-red-500/10
                  flex items-center justify-center
                  text-lg
                  font-bold
                "
              >
                ↪
              </span>

              <span className="font-semibold">
                {loggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>

          {/* FOOTER */}
          <div className="px-4 py-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/40" />

              <span className="text-xs text-slate-400">
                Admin system online
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}