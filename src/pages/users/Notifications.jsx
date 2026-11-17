
import React, { useEffect, useState } from "react";
import { DB } from './components/Header'
import {
  Bell,
  CalendarDays,
  Search,
  RefreshCw,
  Inbox,
  ChevronRight,
} from "lucide-react";

import Header from "./components/Header";
import Footer from "./components/Footer";

function Notifications() {
  const API = `${DB}`;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API}/notifications`);

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // IMAGE URL
  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;

    return `${API}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // DATE FORMAT
  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // SEARCH
  const filteredNotifications = notifications.filter((item) => {
    const value = search.toLowerCase();

    return (
      (item.subject || "").toLowerCase().includes(value) ||
      (item.description || "").toLowerCase().includes(value)
    );
  });

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">

      <Header />

      <main className="w-full flex-1">

        {/* PAGE HEADER */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="w-full px-6 py-8 md:px-12 lg:px-16">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                <Bell size={21} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  All your latest updates and announcements in one place.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* NOTIFICATION CONTENT */}
        <div className="w-full px-6 py-8 md:px-12 lg:px-16">

          {/* TOP BAR */}
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h2 className="text-base font-bold text-gray-900">
                All Notifications
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {filteredNotifications.length} notifications
              </p>
            </div>

            <div className="flex items-center gap-3">

              {/* SEARCH */}
              <div className="relative w-full sm:w-72">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notifications..."
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-amber-500"
                />
              </div>

              {/* REFRESH */}
              <button
                onClick={fetchNotifications}
                disabled={loading}
                title="Refresh notifications"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
              </button>

            </div>
          </div>

          {/* LIST HEADER */}
          <div className="hidden grid-cols-12 items-center border-y border-gray-200 bg-gray-50 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 md:grid">
            <div className="col-span-7">Notification Details</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2 text-right">Type</div>
          </div>

          {/* NOTIFICATION LIST */}
          <div className="w-full">

            {loading ? (
              <div className="flex flex-col items-center py-20">
                <RefreshCw
                  size={28}
                  className="animate-spin text-amber-700"
                />
                <p className="mt-3 text-sm text-gray-500">
                  Loading notifications...
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center py-24 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <Inbox size={30} />
                </div>

                <h3 className="mt-4 text-base font-bold text-gray-800">
                  {search
                    ? "No matching notifications"
                    : "No notifications yet"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {search
                    ? "Try searching with another keyword."
                    : "We'll let you know when something new arrives."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 border-b border-gray-100">

                {filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    className="group grid grid-cols-1 items-center gap-4 px-4 py-5 transition duration-200 hover:bg-amber-50/50 md:grid-cols-12 md:px-5"
                  >

                    {/* DETAILS */}
                    <div className="col-span-7 flex min-w-0 items-center gap-4">

                      {/* NOTIFICATION IMAGE */}
                      <div className="relative shrink-0">
                        {item.image ? (
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.subject}
                            className="h-14 w-14 rounded-lg border border-gray-100 object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                            <Bell size={22} />
                          </div>
                        )}

                        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-amber-600" />
                      </div>

                      {/* SUBJECT AND DESCRIPTION */}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-gray-900 group-hover:text-amber-800">
                          {item.subject}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                          {item.description}
                        </p>
                      </div>

                    </div>

                    {/* DATE */}
                    <div className="col-span-3 flex items-center gap-2 pl-[72px] text-xs text-gray-500 md:pl-0">
                      <CalendarDays
                        size={15}
                        className="shrink-0 text-gray-400"
                      />

                      <div>
                        <p>{formatDate(item.createdAt)}</p>
                        <p className="mt-1 text-gray-400">
                          {formatTime(item.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* TYPE */}
                    <div className="col-span-2 flex items-center justify-between pl-[72px] md:justify-end md:pl-0">
                      <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                        Announcement
                      </span>

                      <ChevronRight
                        size={17}
                        className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-amber-700 md:hidden"
                      />
                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

          {/* BOTTOM */}
          {!loading && filteredNotifications.length > 0 && (
            <p className="mt-5 text-center text-xs text-gray-400">
              Showing {filteredNotifications.length} notifications
            </p>
          )}

        </div>
      </main>

      <Footer />

    </div>
  );
}

export default Notifications;
