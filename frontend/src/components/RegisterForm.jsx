import { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import { NavLink, useLocation } from 'react-router-dom';
import './RegisterForm.css';

const RegisterForm = () => {
  const { state } = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: state?.role ? state.role : 'client',
  });

  const { register } = useContext(AuthContext);
  const { name, email, password, role } = formData;

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('https://gig-server.onrender.com/api/users', formData);
      register(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="register-page relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-bg">
      
      {/* Animated glowing orb */}
      <div className="glow-orb"></div>

      {/* Glass Form */}
      <form 
        onSubmit={onSubmit} 
        className="relative z-10 w-full max-w-md p-8 rounded-xl shadow-lg glass-form text-white mx-4 sm:mx-6"
      >
        <NavLink to={'/'} className={'absolute top-2 left-3'}>
          <p>&larr; Back to home</p>
        </NavLink>
        
        <h2 className="text-3xl font-bold mb-6 text-center drop-shadow-lg">Register</h2>

        <div className="mb-4">
          <label className="block font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            required
            placeholder="Your Name"
            className="w-full px-3 py-2 mt-1 border border-white/30 rounded-md bg-white/5 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            placeholder="you@example.com"
            className="w-full px-3 py-2 mt-1 border border-white/30 rounded-md bg-white/5 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            placeholder="********"
            className="w-full px-3 py-2 mt-1 border border-white/30 rounded-md bg-white/5 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium">Role</label>
          <select
            name="role"
            value={role}
            onChange={onChange}
            className="w-full px-3 py-2 mt-1 border border-white/30 rounded-md bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            <option value="client" className='bg-black/90'>Client</option>
            <option value="freelancer" className='bg-black/90'>Freelancer</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-red-600 rounded-md font-semibold transition transform hover:scale-105 shadow-lg text-white cursor-pointer"
        >
          Register
        </button>

        
        <NavLink to={'/login'}>
          <p className='text-end mt-4 ml-1 underline'>You have an account</p>
        </NavLink>
      </form>
    </div>
  );
};

export default RegisterForm;
