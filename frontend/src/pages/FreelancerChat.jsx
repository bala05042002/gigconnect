import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const ENDPOINT = API;

const FreelancerChat = () => {
  const { state } = useLocation();
  const myUser = state.user;
  const opponent = state.currentChat?.user;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chat, setChat] = useState(null);

  const [socketConnected, setSocketConnected] = useState(false);
  const socket = useRef(null);

  // presence handling
  const [opponentOnline, setOpponentOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null); // timestamp or null
  const onlineTimeoutRef = useRef(null);

  // scrolling control
  const messagesContainerRef = useRef(null);
  const userScrolledUpRef = useRef(false); // true when user is reading older messages
  const forceScrollRef = useRef(false); // force scroll once (e.g. after send or initial load)
  const [showNewMsgBadge, setShowNewMsgBadge] = useState(false);

  // ---------- Socket setup (no logic change) ----------
  useEffect(() => {
    // connect with userId in query (your server already expects this)
    socket.current = io(ENDPOINT, { query: { userId: myUser._id } });

    socket.current.on("connect", () => setSocketConnected(true));
    socket.current.on("disconnect", () => setSocketConnected(false));

    // handle incoming messages
    socket.current.on("message received", (incoming) => {
      if (!incoming?.text) return;

      // only update if message belongs to current chat
      if (chat && (incoming.chatId === chat._id || incoming.chat?._id === chat._id)) {
        // If user has scrolled up, show badge; otherwise append and scroll
        if (userScrolledUpRef.current) {
          setMessages((prev) => [...prev, incoming]);
          setShowNewMsgBadge(true);
        } else {
          setMessages((prev) => [...prev, incoming]);
          // allow auto-scroll effect to run
          forceScrollRef.current = true;
        }
      }
    });

    // presence updates (server emits update_user_status)
    socket.current.on("update_user_status", (payload) => {
      try {
        if (!payload || !payload.userId) return;

        // only consider updates for our opponent
        if (!opponent?._id) return;
        if (payload.userId.toString() !== opponent._id.toString()) return;

        // If server gives explicit lastSeen or timestamp, use them
        const payloadTs = payload.lastSeen || payload.timestamp || payload.time || null;

        if (payload.status === "online") {
          // opponent is online: set flag and clear lastSeen
          setOpponentOnline(true);
          setLastSeen(null);

          // clear any previous offline-timer and set 60s freeze
          if (onlineTimeoutRef.current) {
            clearTimeout(onlineTimeoutRef.current);
            onlineTimeoutRef.current = null;
          }
          onlineTimeoutRef.current = setTimeout(() => {
            // After 60s, assume offline (unless a new update arrives)
            setOpponentOnline(false);
            setLastSeen(Date.now());
            onlineTimeoutRef.current = null;
          }, 60 * 1000);
        } else {
          // status not online => offline or unknown
          setOpponentOnline(false);

          // prefer server-provided timestamp else mark now
          const when = payloadTs ? new Date(payloadTs).getTime() : Date.now();
          setLastSeen(when);

          // freeze for 60s so it doesn't flip repeatedly
          if (onlineTimeoutRef.current) {
            clearTimeout(onlineTimeoutRef.current);
            onlineTimeoutRef.current = null;
          }
          onlineTimeoutRef.current = setTimeout(() => {
            setOpponentOnline(false);
            onlineTimeoutRef.current = null;
          }, 60 * 1000);
        }
      } catch (err) {
        console.error("Error handling update_user_status:", err);
      }
    });

    // cleanup
    return () => {
      if (socket.current) socket.current.disconnect();
      if (onlineTimeoutRef.current) {
        clearTimeout(onlineTimeoutRef.current);
        onlineTimeoutRef.current = null;
      }
    };
    // intentionally including opponent._id and chat so updates apply to correct conversation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUser._id, opponent?._id, chat?._id]);

  // ---------- Init chat once socket connected and opponent exists ----------
  useEffect(() => {
    if (!socketConnected || !opponent?._id) return;

    const initChat = async () => {
      try {
        const { data } = await axios.post(
          `${API}/api/chats`,
          { userId: opponent._id },
          { headers: { Authorization: `Bearer ${myUser.token}` } }
        );
        setChat(data);

        socket.current.emit("join chat", data._id);

        const res = await axios.get(`${API}/api/chats/${data._id}/messages`, {
          headers: { Authorization: `Bearer ${myUser.token}` },
        });
        setMessages(res.data || []);

        // after loading history, force a scroll to bottom once
        forceScrollRef.current = true;
        // reset new message badge
        setShowNewMsgBadge(false);
      } catch (err) {
        console.error("CLIENT: Error initializing chat:", err);
      }
    };

    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnected, opponent, myUser.token]);

  // ---------- Send message (unchanged behavior) ----------
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chat) return;

    try {
      const { data } = await axios.post(
        `${API}/api/chats/${chat._id}/message`,
        { text: newMessage },
        { headers: { Authorization: `Bearer ${myUser.token}` } }
      );

      const latestMsg = data.messages[data.messages.length - 1];
      setMessages((prev) => [...prev, latestMsg]);
      setNewMessage("");
      // after sending, force scroll to bottom
      forceScrollRef.current = true;
      setShowNewMsgBadge(false);
      socket.current.emit("new message", { ...latestMsg, chatId: chat._id });
    } catch (err) {
      console.error("CLIENT: Error sending message:", err);
    }
  };

  // ---------- Scroll behavior ----------
  // scroll container to bottom when appropriate
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const scrollToBottom = (smooth = true) => {
      try {
        if (smooth) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
        else container.scrollTop = container.scrollHeight;
      } catch (err) {
        container.scrollTop = container.scrollHeight;
      }
    };

    // if forced (initial load or after sending), always scroll
    if (forceScrollRef.current) {
      scrollToBottom(true);
      forceScrollRef.current = false;
      userScrolledUpRef.current = false;
      setShowNewMsgBadge(false);
      return;
    }

    // otherwise scroll only if user is at/near bottom already
    const threshold = 120;
    const isAtBottom = container.scrollTop + container.clientHeight + threshold >= container.scrollHeight;
    if (isAtBottom && !userScrolledUpRef.current) {
      scrollToBottom(true);
      setShowNewMsgBadge(false);
    } else {
      // user is scrolled up; show badge only on new message (handled earlier)
    }
  }, [messages]);

  // attach scroll listener to detect manual scrolling up
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      const threshold = 120;
      const isAtBottom = container.scrollTop + container.clientHeight + threshold >= container.scrollHeight;
      userScrolledUpRef.current = !isAtBottom;
      if (isAtBottom) {
        setShowNewMsgBadge(false);
      }
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    // initialize flag
    onScroll();

    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  // helper - format last seen nicely
  const formatLastSeen = (ts) => {
    if (!ts) return "Unknown";
    try {
      const d = new Date(ts);
      return d.toLocaleString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "short",
      });
    } catch {
      return "Unknown";
    }
  };

  // ---------- Responsive dark UI (appearance only) ----------
  return (
    <div
      className="flex justify-center items-center min-h-screen px-4"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% 10%, rgba(77,171,247,0.03), transparent 6%), radial-gradient(1000px 500px at 90% 90%, rgba(26,115,232,0.03), transparent 6%), linear-gradient(180deg, #030612 0%, #071026 40%, #0b1220 100%)",
        color: "#e6eef8",
        paddingTop: 20,
        paddingBottom: 20,
      }}
    >
      <div
        className="flex flex-col w-full max-w-3xl h-[90vh] rounded-xl shadow-xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(12,18,28,0.78), rgba(6,10,18,0.92))",
          border: "1px solid rgba(255,255,255,0.03)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.03)",
            backdropFilter: "saturate(110%) blur(4px)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 44,
                height: 44,
                background: "linear-gradient(135deg,#0ea5e9,#1e40af)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                boxShadow: "0 4px 12px rgba(14,165,233,0.12)",
              }}
            >
              {opponent?.name ? opponent.name.slice(0, 1).toUpperCase() : "U"}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#e6f4ff" }}>{opponent?.name || "Unknown"}</div>
              {/* <div style={{ fontSize: 12, color: opponentOnline ? "#89f7b5" : "rgba(230,238,248,0.6)" }}>
                {opponentOnline ? "Online" : lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : socketConnected ? "Last seen: Unknown" : "Connecting..."}
              </div> */}
            </div>
          </div>

          <div style={{ fontSize: 13, color: "rgba(230,238,248,0.6)" }}>Secure chat</div>
        </div>

        {/* Messages container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-5 py-4"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.06) transparent",
          }}
        >
          <div className="flex flex-col gap-3">
            {messages.map((msg, i) => {
              const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
              const isMe = senderId === myUser._id;
              const key = msg._id || `msg-${i}`;

              return (
                <div key={key} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div style={{ maxWidth: "75%" }}>
                    <div
                      className="px-4 py-2 rounded-2xl break-words"
                      style={{
                        background: isMe ? "linear-gradient(135deg,#4dabf7,#1a73e8)" : "rgba(255,255,255,0.02)",
                        color: isMe ? "#fff" : "#dbeafe",
                        boxShadow: isMe ? "0 6px 18px rgba(26,115,232,0.14)" : "0 4px 10px rgba(0,0,0,0.45)",
                        borderRadius: isMe ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                        fontSize: 15,
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.text}
                    </div>

                    {msg.createdAt && (
                      <div style={{ fontSize: 11, color: "rgba(230,238,248,0.45)", marginTop: 6 }}>
                        {new Date(msg.createdAt).toLocaleString([], { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* New messages badge when user scrolled up and new messages arrive */}
        {showNewMsgBadge && (
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: "110px", zIndex: 40 }}>
            <button
              onClick={() => {
                const c = messagesContainerRef.current;
                if (c) {
                  c.scrollTo({ top: c.scrollHeight, behavior: "smooth" });
                }
                userScrolledUpRef.current = false;
                setShowNewMsgBadge(false);
              }}
              style={{
                background: "linear-gradient(135deg,#0ea5e9,#1e40af)",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: 20,
                boxShadow: "0 6px 18px rgba(14,165,233,0.12)",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              New messages
            </button>
          </div>
        )}

        {/* Input */}
        <form onSubmit={sendMessage} className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.02)" }}>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-3 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.02)",
                color: "#e6eef8",
                border: "1px solid rgba(255,255,255,0.03)",
                outline: "none",
                fontSize: 15,
              }}
            />
            <button
              type="submit"
              className="px-4 py-3 rounded-lg"
              style={{
                background: "linear-gradient(135deg,#0ea5e9,#1e40af)",
                color: "#fff",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(14,165,233,0.12)",
              }}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FreelancerChat;
