import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

let socket;

const ChatPage = () => {
  const { user } = useContext(AuthContext); // Logged-in user
  const { receiverId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    socket = io(`${import.meta.env.VITE_API_URL}`);
    socket.emit('addUser', user._id);

    socket.on('getMessage', (data) => {
      if (data.senderId === receiverId) {
        setMessages((prev) => [...prev, { sender: data.senderId, receiver: user._id, text: data.text }]);
      }
    });

    return () => socket.disconnect();
  }, [user._id, receiverId]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${receiverId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages(data);
    };
    fetchMessages();
  }, [receiverId, user.token]);

  const handleSend = async () => {
    if (!newMessage) return;

    const message = {
      sender: user._id,
      receiver: receiverId,
      text: newMessage,
    };

    // Send via Socket
    socket.emit('sendMessage', message);

    // Save in DB
    await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, message, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    setMessages([...messages, message]);
    setNewMessage('');
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>

      <div className="border rounded-lg p-4 h-[500px] overflow-y-auto flex flex-col">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            ref={scrollRef}
            className={`p-2 my-1 rounded ${
              msg.sender === user._id ? 'self-end bg-indigo-500 text-white' : 'self-start bg-gray-200'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="mt-4 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-l px-4 py-2"
        />
        <button onClick={handleSend} className="bg-indigo-600 text-white px-4 py-2 rounded-r hover:bg-indigo-700">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
