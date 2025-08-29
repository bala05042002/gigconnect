import { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import './LoginForm.css';
import { NavLink } from 'react-router-dom';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { login } = useContext(AuthContext);
  const { email, password } = formData;

  const onChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/login', formData);
      login(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="login-page relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-bg">
      
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
        <h2 className="text-3xl font-bold mb-6 text-center drop-shadow-lg">Login</h2>

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

        <div className="mb-6">
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

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-red-600 rounded-md font-semibold transition transform hover:scale-105 shadow-lg text-white cursor-pointer"
        >
          Login
        </button>

        <NavLink to={'/register'}>
          <p className='text-end mt-4 ml-1 underline'>You don't have an account</p>
        </NavLink>
      </form>
    </div>
  );
};

export default LoginForm;
