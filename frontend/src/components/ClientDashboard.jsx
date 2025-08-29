// src/components/ClientDashboard.jsx

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import GigList from './GigList'; // Assuming you have a component to list client's gigs

const ClientDashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== 'client') {
    return <div>You are not authorized to view this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Client Dashboard</h1>
      <div className="flex justify-between items-center mb-6">
        <p className="text-xl">Welcome, {user.name}!</p>
        <Link to="/post-gig" className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
          Post a New Gig
        </Link>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Your Posted Gigs</h2>
      {/* This GigList component would fetch and display all gigs posted by the current client. */}
      {/* This will require you to create a new API endpoint on the backend like /api/gigs/my-gigs */}
      <GigList />
    </div>
  );
};

export default ClientDashboard;