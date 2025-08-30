import { useContext, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import NotificationDropdown from "./NotificationDropdown";

const ChatWindow = ({ onClose, chatPartner, receiverId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const { user, authToken } = useContext(AuthContext);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!chatPartner) return;
            try {
                // Fetch real messages from the new backend endpoint
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/direct-chat/${user._id}/${receiverId}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
                setMessages(response.data);
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
        };
        fetchMessages();
    }, [receiverId, chatPartner, user, authToken]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessageHandler = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            // Send the new message to the new backend endpoint
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/direct-chat`, {
                senderId: user._id,
                receiverId: receiverId,
                text: newMessage,
                timestamp: Date.now()
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            setMessages([...messages, res.data]);
            setNewMessage('');
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    if (!chatPartner) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-100 flex flex-col z-50">
            <div className="p-4 border-b flex justify-between items-center bg-indigo-600 text-white shadow-lg">
                <h3 className="font-semibold text-lg">Chat with {chatPartner.name}</h3>
                <button onClick={onClose} className="text-white hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`px-4 py-2 rounded-lg max-w-[75%] shadow-md ${msg.senderId === user._id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessageHandler} className="p-4 border-t bg-white flex items-center gap-2 shadow-inner">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </form>
        </div>
    );
};
