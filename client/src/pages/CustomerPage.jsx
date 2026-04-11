import NavigationBar from "../components/NavigationBar";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bannerImg from "../assets/banner.png";
import userIcon from "../assets/user.png";
import roomIcon from "../assets/room.png";
import deviceIcon from "../assets/device.png";
import { getSessionRoleState } from "../auth";
import { apiFetch } from "../api"; 

export default function CustomerPage() {
  const navigate = useNavigate();
  const { isStaff, isAdmin } = getSessionRoleState();

  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const [summaryMessages, setSummaryMessages] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (category !== "All") params.set("type", category === "Books" ? "1" : "2");
    navigate(`/catalog?${params.toString()}`);
  };

  useEffect(() => {
    const fetchNotificationSummary = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const res = await apiFetch("/api/notifications/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setSummaryMessages(data.summaryMessages || []);
          setRecentNotifications(data.recentNotifications || []);
        } else {
          console.error(data.error || "Failed to load notification summary");
        }
      } catch (err) {
        console.error("Notification summary fetch error:", err);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotificationSummary();
  }, []);

  const customerCards = [
    {
      title: "Rent a Device",
      description: "Rent laptops, tablets, and other devices.",
      icon: deviceIcon,
      path: "/rent-a-device"
    },
    {
      title: "Rent a Room",
      description: "Reserve study rooms and spaces.",
      icon: roomIcon,
      path: "/rent-a-room"
    },
    {
      title: "View My Account",
      description: "View account information, borrowed items and holds.",
      icon: userIcon,
      path: isAdmin ? "/admin" : isStaff ? "/staff" : "/view-account"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <NavigationBar />

      <section className="relative">
        <div
          className="h-[380px] bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: `url(${bannerImg})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative w-full max-w-4xl px-6 text-left">
            <h1 className="text-4xl font-bold text-white mb-6 drop-shadow">
              Search this library's catalog
            </h1>

            <div className="bg-white rounded-lg shadow-lg p-3 flex flex-col md:flex-row gap-3 items-center">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option>All</option>
                <option>Books</option>
                <option>CDs</option>
              </select>

              <input
                type="text"
                placeholder="Search the library..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-4 py-2"
              />

              <button
                onClick={handleSearch}
                className="bg-green-800 text-white px-5 py-2 rounded font-semibold hover:bg-green-900"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>


      {!loadingNotifications && (summaryMessages.length > 0 || recentNotifications.length > 0) && (
        <section className="max-w-6xl mx-auto px-6 pt-6">
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl shadow-sm p-5">
            <h2 className="text-xl font-semibold text-yellow-900 mb-3">
              Notifications
            </h2>

            {summaryMessages.length > 0 && (
              <div className="mb-4">
                <ul className="list-disc pl-5 text-gray-800">
                  {summaryMessages.map((message, index) => (
                    <li key={index}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            {recentNotifications.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Recent Updates</h3>
                <div className="space-y-2">
                  {recentNotifications.map((note) => (
                    <div
                      key={note.Notification_ID}
                      className="bg-white border rounded-lg px-4 py-3"
                    >
                      <p className="text-sm text-gray-800">{note.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={() => navigate("/view-account")}
                className="text-green-800 font-semibold hover:underline"
              >
                View all account notifications
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customerCards.map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.path)}
              className="relative bg-white rounded-xl shadow-md cursor-pointer transition hover:shadow-lg hover:scale-105 aspect-square p-3  mx-auto flex flex-col items-center justify-center text-center overflow-hidden border border-transparent hover:border-green-800"
            >
              <div className="absolute inset-0 bg-black opacity-0 hover:opacity-5 transition"></div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 flex items-center justify-center mb-3">
                  <img
                    src={card.icon}
                    alt={card.title}
                    className="w-16 h-16 object-contain"
                  />
                </div>

                <h3 className="text-lg font-semibold text-green-900">
                  {card.title}
                </h3>

                <p className="text-sm text-gray-600 mt-0">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}