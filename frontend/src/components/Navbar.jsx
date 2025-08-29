import { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleChatClick = () => {
    navigate(`/chat/${user._id}`);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest("#mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-blue-900 p-4 shadow-md relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          GigConnect
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4 items-center">
          <Link to="/" className="text-white hover:text-indigo-200">Home</Link>
          <Link to="/gigs" className="text-white hover:text-indigo-200">Gigs</Link>

          {user && user.role === "client" && (
            <>
              <Link to="/gigs/create" className="text-white hover:text-indigo-200">Post Gig</Link>
              <Link to="/mygigs" className="text-white hover:text-indigo-200">My Gigs</Link>
              <Link to="/freelancers" className="text-white hover:text-indigo-200">Freelancers</Link>
            </>
          )}

          {user && user.role === "freelancer" && (
            <Link to="/my-freelancer-gigs" className="text-white hover:text-indigo-200">My Applied Gigs</Link>
          )}

          {user && (
            <>
              {/* <button onClick={handleChatClick} className="text-white hover:text-indigo-200">Chat</button> */}
              <NotificationDropdown />
            </>
          )}

          {user ? (
            <>
              <Link to={`/profiles/${user._id}`} className="text-white hover:text-indigo-200">Profile</Link>
              <button onClick={logout} className="text-white hover:text-indigo-200">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-indigo-200">Login</Link>
              <Link to="/register" className="text-white hover:text-indigo-200">Register</Link>
            </>
          )}
        </div>

        {/* Mobile Action Buttons + Hamburger */}
        <div className="flex items-center md:hidden space-x-2">
          {user && (
            <>
              {/* <button onClick={handleChatClick} className="text-white hover:text-indigo-200">
                Chat
              </button> */}
              <NotificationDropdown />
            </>
          )}

          <button
            id="mobile-menu-button"
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Box with Smooth Animation */}
      <div
        ref={dropdownRef}
        className={`md:hidden absolute right-4 top-full mt-2 w-56 bg-blue-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-96 opacity-100 py-2" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="flex flex-col px-4 space-y-2">
          <Link to="/" className="text-white hover:text-indigo-200" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/gigs" className="text-white hover:text-indigo-200" onClick={() => setIsMobileMenuOpen(false)}>Gigs</Link>

          {user && user.role === "client" && (
            <>
              <Link to="/gigs/create" className="text-white hover:text-indigo-200" onClick={() => setIsMobileMenuOpen(false)}>Post Gig</Link>
              <Link to="/mygigs" className="text-white hover:text-indigo-200" onClick={() => setIsMobileMenuOpen(false)}>My Gigs</Link>
              <Link to="/freelancers" className="text-white hover:text-indigo-200" onClick={() => setIsMobileMenuOpen(false)}>Freelancers</Link>
            </>
          )}

          {user && user.role === "freelancer" && (
            <Link to="/my-freelancer-gigs" className="text-white hover:text-indigo-200" onClick={() => setIsMobileMenuOpen(false)}>My Applied Gigs</Link>
          )}

          {user ? (
            <>
              <Link to={`/profiles/${user._id}`} className="text-white hover:text-indigo-200" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
              <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-white hover:text-indigo-200">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-indigo-200" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="text-white hover:text-indigo-200" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
