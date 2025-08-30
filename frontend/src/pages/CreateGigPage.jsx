import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { getCurrentPosition } from "../utils/geo";
import AuthContext from "../context/AuthContext";

const CreateGigPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Web Development",
    price: "",
  });
  const [loading, setLoading] = useState(false);

  const { title, description, category, price } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (user?.role !== "client") {
      toast.error("Only clients can create gigs.");
      setLoading(false);
      return;
    }

    if (!user?.token) {
      toast.error("User token is missing. Please login again.");
      setLoading(false);
      return;
    }

    try {
      let lat = 0,
        lon = 0;

      try {
        const position = await getCurrentPosition();
        lat = position.lat;
        lon = position.lon;
      } catch (geoError) {
        console.warn("Geolocation failed, using default coordinates:", geoError);
        toast.info("Geolocation failed. Using default location.");
      }

      const location = {
        type: "Point",
        coordinates: [lon, lat],
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const payload = { ...formData, location };
      console.log("Submitting payload:", payload);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/gigs`, payload, config);

      console.log("Backend response:", response.data);
      toast.success("Gig created successfully!");
      navigate("/gigs");
    } catch (error) {
      console.error("Error creating gig:", error);

      if (error.response) {
        console.error("Backend error response:", error.response.data);
        toast.error(`Failed to create gig: ${error.response.data.message || "Unknown error"}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("Failed to create gig: No response from server.");
      } else {
        toast.error(`Failed to create gig: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        background:
          "radial-gradient(800px 400px at 10% 20%, rgba(99,102,241,0.04), transparent 6%), radial-gradient(700px 350px at 95% 80%, rgba(14,165,233,0.035), transparent 6%), linear-gradient(180deg,#020617 0%, #071032 60%, #081025 100%)",
      }}
    >
      <div className="w-full max-w-3xl">
        {/* Glass card */}
        <div
          className="rounded-2xl overflow-hidden shadow-xl"
          style={{
            border: "1px solid rgba(255,255,255,0.04)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
            backdropFilter: "blur(8px) saturate(120%)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-5"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.03)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0))",
            }}
          >
            <h1 className="text-xl md:text-2xl font-bold text-white">Post a New Gig</h1>
            <div className="text-sm md:text-base text-indigo-300">Welcome, {user?.name || "Client"}</div>
          </div>

          {/* Body */}
          <div className="px-6 py-6 md:px-8 md:py-8">
            {/* Loading shimmer skeleton while submitting */}
            {loading ? (
              <div className="space-y-6">
                <div className="animate-pulse">
                  <div className="h-6 w-3/4 bg-gray-700 rounded-md mb-4" />
                  <div className="h-6 w-full bg-gray-700 rounded-md mb-2" />
                  <div className="h-36 w-full bg-gray-700 rounded-md mb-3" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="h-10 bg-gray-700 rounded-md" />
                    <div className="h-10 bg-gray-700 rounded-md" />
                  </div>
                  <div className="flex justify-end mt-6">
                    <div className="h-10 w-36 bg-gray-700 rounded-md" />
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label htmlFor="title" className="block text-gray-300 font-medium mb-2">
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={title}
                    onChange={onChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="e.g., I will build your website"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-gray-300 font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={onChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Describe what you will deliver..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-gray-300 font-medium mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={category}
                      onChange={onChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option>Web Development</option>
                      <option>Graphic Design</option>
                      <option>Writing</option>
                      <option>Gardening</option>
                      <option>Plumbing</option>
                      <option>Cleaning</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-gray-300 font-medium mb-2">
                      Price (₹)
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      value={price}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold hover:from-indigo-400 hover:to-blue-400 transition"
                  >
                    {loading ? "Posting..." : "Post Gig"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/5 bg-gradient-to-t from-transparent to-white/1">
            <div className="text-center text-sm text-gray-400">
              By posting a gig you agree to our <span className="text-indigo-300">terms</span>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGigPage;
