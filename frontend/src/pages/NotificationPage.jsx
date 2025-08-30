import { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import axios from "axios";
import AuthContext from "../context/AuthContext";

// Shimmer placeholder component
const NotificationShimmer = () => (
  <div className="animate-pulse px-4 py-2">
    <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
    <div className="h-4 bg-gray-700 rounded w-full"></div>
  </div>
);

const NotificationPage = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, config);
        setNotifications(data || []);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark as read when clicking
  const markAsRead = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`, {}, config);

      // Update state
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative text-white hover:text-indigo-200"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-800/90 backdrop-blur-md text-white shadow-lg rounded-lg overflow-hidden z-50">
          <div className="p-2 font-semibold border-b border-gray-700">Notifications</div>
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              // Shimmer placeholders while loading
              Array.from({ length: 5 }).map((_, idx) => <NotificationShimmer key={idx} />)
            ) : notifications.length ? (
              notifications.map((n) => (
                <Link
                  key={n._id}
                  to={n.link || "#"}
                  onClick={() => markAsRead(n._id)}
                  className={`block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                    n.read ? "text-gray-400" : "text-white font-semibold"
                  }`}
                >
                  {n.message}
                </Link>
              ))
            ) : (
              <div className="p-4 text-sm text-gray-400 text-center">
                No notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
