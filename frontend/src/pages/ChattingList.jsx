import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ChattingList = () => {
  const [chats, setChats] = useState([]); // ✅ always array

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/chats`,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

        console.log("Chats API response:", data); // 👀 debug log

        // Ensure it's an array
        setChats(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching chats:", error);
        setChats([]); // fallback
      }
    };

    fetchChats();
  }, [userInfo.token]);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white px-4">
      <div className="w-full max-w-2xl bg-gray-800 shadow-lg rounded-2xl p-6">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {chats.length > 1 ? 'Chats' : 'No Chats'}
        </h2>

        {chats?.length === 0 ? (
          <p className="text-center text-gray-400">No chats found</p>
        ) : (
          <ul className="divide-y divide-gray-700">
            {chats.map((chat) => {
              const otherUser = chat.participants.find(
                (p) => p._id !== userInfo._id
              );

              return (
                <div key={chat._id}>
                  {chat.messages?.length > 0 ? (
                    <li
                      key={chat._id}
                      className="p-4 flex justify-between items-center cursor-pointer transition-all duration-200 hover:bg-gray-700 rounded-xl"
                      onClick={() => {
                        navigate("chatfromnav", {
                          state: { user: userInfo, currentChat: otherUser },
                        });
                      }}
                    >
                      <div>
                        <div className="font-semibold text-lg text-white">
                          {otherUser?.name}
                        </div>
                        <div className="text-sm text-gray-400 truncate max-w-xs">
                          {chat.messages[chat.messages.length - 1].sender._id ===
                          userInfo._id
                            ? "You: "
                            : ""}
                          {chat.messages[chat.messages.length - 1].text}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(
                          chat.messages[chat.messages.length - 1].createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </li>
                  ) : (
                    <></>
                  )}
                </div>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChattingList;
