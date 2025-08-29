import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import FreelancerHeader from '../components/FreelancerHeader';

let socket;

const DirectChatPage = ({ currentUserId }) => {
  const { freelancerId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [freelancerOnline, setFreelancerOnline] = useState(false);
  const scrollRef = useRef();

  // --- Fetch chat history on mount ---
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `https://gig-server.onrender.com/api/direct-chat/${currentUserId}/${freelancerId}`
        );
        setMessages(data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();
  }, [currentUserId, freelancerId]);

  // --- Socket.IO connection ---
  useEffect(() => {
    socket = io('https://gig-server.onrender.com', { query: { userId: currentUserId } });

    // Real-time message listener
    socket.on('receive_direct_message', (message) => {
      if (
        (message.senderId === freelancerId && message.receiverId === currentUserId) ||
        (message.senderId === currentUserId && message.receiverId === freelancerId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Online status listener
    socket.on('user_online', (userId) => {
      if (userId === freelancerId) setFreelancerOnline(true);
    });
    socket.on('user_offline', (userId) => {
      if (userId === freelancerId) setFreelancerOnline(false);
    });

    // Join personal room
    socket.emit('join_direct_chat', { userId: currentUserId, freelancerId });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId, freelancerId]);

  // --- Auto scroll ---
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Send message ---
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: freelancerId,
      text: newMessage,
      timestamp: new Date(),
    };

    try {
      // Emit via socket
      socket.emit('send_direct_message', messageData);

      // Save to backend
      await axios.post('https://gig-server.onrender.com/api/direct-chat', messageData);

      // Update local state
      setMessages((prev) => [...prev, messageData]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      {/* Header with freelancer info and online status */}
      <FreelancerHeader freelancerId={freelancerId} online={freelancerOnline} />

      {/* Chat window */}
      <div className="bg-white rounded-lg shadow-md p-4 h-[500px] overflow-y-auto mb-4 flex flex-col">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 flex ${
              msg.senderId === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`p-2 rounded-lg max-w-xs break-words ${
                msg.senderId === currentUserId
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
              ref={scrollRef}
            >
              {msg.text}
              <div className="text-xs text-gray-400 mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input box */}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 border rounded-md"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default DirectChatPage;
