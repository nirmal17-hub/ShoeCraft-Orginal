
import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  ShoppingCart,
  UserRound,
  ChevronDown,
  Package,
  Lock,
  MessageCircle,
  LogOut,
  Bell,
  CalendarDays,
  ArrowRight,
  X,
} from "lucide-react";
export const DB = import.meta.env.VITE_API_URL
function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // FETCH NOTIFICATIONS
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setNotificationLoading(true);

        const response = await fetch(`${DB}/notifications`);

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();

        const activeNotifications = data
          .filter((item) => Number(item.status) === 1)
          .sort(
            (a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
          );

        setNotifications(activeNotifications);
      } catch (error) {
        console.error("Notification error:", error);
      } finally {
        setNotificationLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // UPDATE USER
  useEffect(() => {
    const updateUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user") || "null"));
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("storage", updateUser);
    window.addEventListener("userChanged", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
      window.removeEventListener("userChanged", updateUser);
    };
  }, []);

  // CLOSE DROPDOWNS ON NAVIGATION
  useEffect(() => {
    setDropdownOpen(false);
    setNotificationOpen(false);
  }, [location.pathname]);

  // IMAGE URL
  const getImageUrl = (image) => {
    if (!image) return null;

    if (image.startsWith("http")) return image;

    return `${DB}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // DATE FORMAT
  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("user");

    setUser(null);
    setNotifications([]);
    setDropdownOpen(false);
    setNotificationOpen(false);

    window.dispatchEvent(new Event("userChanged"));

    navigate("/", {
      replace: true,
      state: {
        authTransition: true,
        authAction: "logout",
      },
    });
  };

  const navigation = [
    { name: "Home", path: "/" },
    { name: "Collections", path: "/collections" },
    { name: "Categories", path: "/category" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="flex h-20 w-full items-center justify-between px-6 md:px-10 lg:px-12">

        {/* LOGO */}
        <Link to="/" className="shrink-0">
          <h1 className="text-2xl font-black tracking-wider text-gray-900">
            SHOE<span className="text-amber-700">CRAFT</span>
          </h1>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`text-sm font-medium transition-colors duration-200 ${
                location.pathname === item.path
                  ? "text-amber-700"
                  : "text-gray-800 hover:text-amber-700"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT SECTION */}
        <div className="flex shrink-0 items-center gap-3">

          {!user ? (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-amber-700 hover:text-amber-700"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {/* PROFILE DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setNotificationOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                    <UserRound size={18} />
                  </div>

                  <span className="max-w-24 truncate text-sm font-semibold text-gray-800">
                    {user.name || "User"}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-xl">

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800"
                    >
                      <UserRound size={17} />
                      My Profile
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800"
                    >
                      <Package size={17} />
                      My Orders
                    </Link>

                    <Link
                      to="/change-password"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800"
                    >
                      <Lock size={17} />
                      Change Password
                    </Link>

                    <Link
                      to="/enquiries"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800"
                    >
                      <MessageCircle size={17} />
                      Enquiries
                    </Link>

                    <div className="my-1 border-t border-gray-100" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* NOTIFICATION BUTTON */}
              <div
                className="relative"
                onMouseEnter={() => {
                  setNotificationOpen(true);
                  setDropdownOpen(false);
                }}
                onMouseLeave={() => setNotificationOpen(false)}
              >
                <button
                  onClick={() => {
                    setNotificationOpen(!notificationOpen);
                    setDropdownOpen(false);
                  }}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-lg border transition ${
                    notificationOpen
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : "border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                  }`}
                  aria-label="Notifications"
                >
                  <Bell size={20} />

                  {notifications.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {notifications.length > 99
                        ? "99+"
                        : notifications.length}
                    </span>
                  )}
                </button>

                {/* NOTIFICATION HOVER PANEL */}
                {notificationOpen && (
                  <div
                    className="absolute right-0 top-12 z-[60] w-[350px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
                    onMouseEnter={() => setNotificationOpen(true)}
                  >
                    {/* HEADER */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          Notifications
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {notifications.length} active notifications
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                        <Bell size={17} />
                      </div>
                    </div>

                    {/* NOTIFICATION LIST */}
                    <div className="max-h-[350px] overflow-y-auto">

                      {notificationLoading ? (
                        <div className="py-10 text-center text-sm text-gray-500">
                          Loading notifications...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center py-10 text-center">
                          <Bell size={30} className="text-gray-300" />
                          <p className="mt-3 text-sm font-semibold text-gray-700">
                            No notifications
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            You're all caught up!
                          </p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-3 border-b border-gray-100 px-4 py-3 transition hover:bg-amber-50/50"
                          >
                            {/* IMAGE */}
                            {item.image ? (
                              <img
                                src={getImageUrl(item.image)}
                                alt={item.subject}
                                className="h-12 w-12 shrink-0 rounded-lg border border-gray-100 object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                                <Bell size={20} />
                              </div>
                            )}

                            {/* DETAILS */}
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-sm font-bold text-gray-900">
                                {item.subject}
                              </h4>

                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">
                                {item.description}
                              </p>

                              <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
                                <CalendarDays size={12} />
                                {formatDate(item.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* VIEW ALL BUTTON */}
                    <div className="border-t border-gray-100 bg-gray-50 p-3">
                      <button
                        onClick={() => {
                          setNotificationOpen(false);
                          navigate("/notifications");
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
                      >
                        View All Notifications
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* CART */}
              <button
                onClick={() => navigate("/cart")}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
              >
                <ShoppingCart size={18} />
                Cart
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
