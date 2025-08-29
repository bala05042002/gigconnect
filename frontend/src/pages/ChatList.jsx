import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";

const ChatList = ({ onSelectChat, onClose }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchConversations = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                // Using fetch instead of axios for single-file compatibility.
                // This is a mock API call.
                const mockConversations = [
                    { _id: "convo1", otherUser: { _id: "freelancer456", name: "Jane Smith", role: "freelancer" }, lastMessage: { content: "I'll get that proposal to you tomorrow." } },
                    { _id: "convo2", otherUser: { _id: "client789", name: "David Johnson", role: "client" }, lastMessage: { content: "Sounds great, looking forward to it." } },
                ];
                setConversations(mockConversations);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch conversations", error);
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user]);

    return (
        <div className="fixed inset-0 bg-gray-100 flex flex-col z-50">
            <div className="p-4 border-b flex justify-between items-center bg-indigo-600 text-white shadow-lg">
                <h3 className="font-semibold text-lg">My Chats</h3>
                <button onClick={onClose} className="text-white hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
                {loading ? (
                    <div className="text-center text-gray-500">Loading chats...</div>
                ) : conversations.length === 0 ? (
                    <div className="text-center text-gray-500">No chats found.</div>
                ) : (
                    conversations.map((convo) => (
                        <div
                            key={convo._id}
                            onClick={() => onSelectChat(convo)}
                            className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <div className="font-medium text-gray-800">{convo.otherUser.name}</div>
                            <div className="text-sm text-gray-500 truncate">{convo.lastMessage?.content}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatList