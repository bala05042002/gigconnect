import { useState, useEffect } from 'react';
import axios from 'axios';

const FreelancerHeader = ({ freelancerId }) => {
  const [freelancer, setFreelancer] = useState({ name: '', profilePhoto: '' });

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/profiles/${freelancerId}`
        );
        setFreelancer({
          name: data.user.name,
          profilePhoto: data.profilePhoto || '/default-avatar.png',
        });
      } catch (err) {
        console.error('Failed to fetch freelancer profile', err);
      }
    };

    fetchFreelancer();
  }, [freelancerId]);

  return (
    <div className="flex items-center gap-3 p-2 border-b">
      <img
        src={freelancer.profilePhoto}
        alt={freelancer.name}
        className="w-12 h-12 rounded-full object-cover"
      />
      <h2 className="text-lg font-semibold">{freelancer.name}</h2>
    </div>
  );
};

export default FreelancerHeader;
