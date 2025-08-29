import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCurrentPosition } from '../utils/geo';
import { Link } from 'react-router-dom';
import './GigListPage.css'; // For animated light & glass effects

// Fix for default marker icon not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const GigShimmer = () => (
  <div className="glass-panel p-6 border-t-4 border-indigo-500 shadow-lg animate-pulse">
    <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
  </div>
);

const GigListPage = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useState({
    lat: '',
    lon: '',
    radius: 100,
  });
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  const { lat, lon, radius } = searchParams;

  useEffect(() => {
    const fetchAllGigs = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('http://localhost:5000/api/gigs');
        setGigs(data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch gigs.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllGigs();
  }, []);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!lat || !lon || !radius) {
      toast.error('Please fill in all search fields.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/gigs/search/location?lat=${lat}&lon=${lon}&radius=${radius}`
      );
      setGigs(data);
      toast.success(`${data.length} gigs found nearby!`);
      setShowLocationSearch(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch gigs.');
      setGigs([]);
    } finally {
      setLoading(false);
    }
  };

  const onParamsChange = (e) => {
    setSearchParams((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleShowLocationSearch = async () => {
    setShowLocationSearch(true);
    setLoading(true);
    try {
      const { lat, lon } = await getCurrentPosition();
      setSearchParams((prev) => ({ ...prev, lat, lon }));
      setMapCenter([lat, lon]);
    } catch (error) {
      toast.info('Could not get your location. Please enter it manually.');
    } finally {
      setLoading(false);
    }
  };

  const filteredGigs = useMemo(() => {
    if (!searchQuery) return gigs;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return gigs.filter(
      (gig) =>
        gig.title.toLowerCase().includes(lowerCaseQuery) ||
        gig.user?.name.toLowerCase().includes(lowerCaseQuery) ||
        gig.price.toString().includes(searchQuery)
    );
  }, [gigs, searchQuery]);

  return (
    <div className="relative min-h-screen bg-gray-900 text-white p-4 md:p-8 overflow-hidden">
      {/* Animated Light Effect */}
      <div className="floating-light light1"></div>
      <div className="floating-light light2"></div>
      <div className="floating-light light3"></div>

      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-indigo-400">
        Find Gigs Near You
      </h1>

      {/* Instant Search Bar */}
      <div className="glass-panel p-6 mb-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-200 text-center">
          Instant Search
        </h2>
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchQueryChange}
          placeholder="Search by title, client, or budget..."
          className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-indigo-400 bg-gray-700 text-white placeholder-gray-400 transition"
        />
      </div>

      {/* Location Search Panel */}
      <div
        className={`glass-panel max-w-2xl mx-auto mb-6 transform transition-transform duration-500 ease-in-out ${
          showLocationSearch ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        {showLocationSearch && (
          <>
            <h2 className="text-xl font-semibold mb-4 text-gray-200 text-center">
              Location Search
            </h2>

            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <input
                type="number"
                name="lat"
                value={lat}
                onChange={onParamsChange}
                placeholder="Latitude"
                step="any"
                className="w-full px-4 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400"
                required
              />
              <input
                type="number"
                name="lon"
                value={lon}
                onChange={onParamsChange}
                placeholder="Longitude"
                step="any"
                className="w-full px-4 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400"
                required
              />
              <input
                type="number"
                name="radius"
                value={radius}
                onChange={onParamsChange}
                placeholder="Radius (km)"
                className="w-full px-4 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400"
                required
              />
              <button
                type="submit"
                className="w-full sm:w-auto py-2 px-6 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search Location'}
              </button>
            </form>

            <div className="my-6 rounded-lg overflow-hidden shadow-lg h-96">
              <MapContainer
                center={mapCenter}
                zoom={7}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                whenCreated={(map) => {
                  map.on('click', (e) => {
                    const { lat, lng } = e.latlng;
                    setSearchParams((prev) => ({ ...prev, lat, lon: lng }));
                    setMapCenter([lat, lng]);
                  });
                }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker
                  position={mapCenter}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const pos = e.target.getLatLng();
                      setSearchParams((prev) => ({ ...prev, lat: pos.lat, lon: pos.lng }));
                      setMapCenter([pos.lat, pos.lng]);
                    },
                  }}
                >
                  <Popup>Selected location</Popup>
                </Marker>

                <Circle
                  center={mapCenter}
                  radius={radius * 1000}
                  pathOptions={{ color: 'cyan', fillColor: 'cyan', fillOpacity: 0.1 }}
                />

                {filteredGigs.map((gig) => (
                  <Marker
                    key={gig._id}
                    position={[gig.location.coordinates[1], gig.location.coordinates[0]]}
                  >
                    <Popup>
                      <div className="font-semibold">{gig.title}</div>
                      <div>{gig.user?.name}</div>
                      <div>${gig.price}</div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const { lat, lon } = await getCurrentPosition();
                  setSearchParams((prev) => ({ ...prev, lat, lon }));
                  setMapCenter([lat, lon]);
                  toast.success('Location set to your current position!');
                } catch (err) {
                  toast.error('Could not get your location. Please select manually.');
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full py-2 px-6 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors mt-2"
            >
              Use My Location
            </button>

            <button
              onClick={() => setShowLocationSearch(false)}
              className="w-full py-2 px-6 bg-gray-600 text-gray-200 font-semibold rounded-md hover:bg-gray-500 transition-colors mt-4"
            >
              Hide Map
            </button>
          </>
        )}
      </div>

      {!showLocationSearch && (
        <div className="text-center">
          <button
            onClick={handleShowLocationSearch}
            className="py-2 px-6 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
          >
            Search by Location
          </button>
        </div>
      )}

      {/* Gigs List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => <GigShimmer key={idx} />)
          : filteredGigs.length > 0
          ? filteredGigs.map((gig) => (
              <Link key={gig._id} to={`/gigs/${gig._id}`}>
                <div className="glass-panel p-6 border-t-4 border-indigo-500 shadow-lg transition-transform transform hover:scale-105">
                  <h2 className="text-xl font-semibold text-white mb-2 truncate">{gig.title}</h2>
                  <p className="text-gray-300 mb-4 text-sm line-clamp-3">{gig.description}</p>
                  <div className="text-sm text-gray-200 space-y-1">
                    <p>
                      **Category:** <span className="font-medium text-indigo-400">{gig.category}</span>
                    </p>
                    <p>
                      **Price:** <span className="font-medium text-green-400">${gig.price}</span>
                    </p>
                    <p>
                      **Status:**{' '}
                      <span
                        className={`font-medium ${
                          gig.status === 'open' ? 'text-green-400' : 'text-yellow-400'
                        }`}
                      >
                        {gig.status}
                      </span>
                    </p>
                    <p>
                      **Posted By:** <span className="font-medium">{gig.user?.name || 'N/A'}</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))
          : <p className="text-center text-gray-500 col-span-full">No gigs found matching your search.</p>}
      </div>
    </div>
  );
};

export default GigListPage;
