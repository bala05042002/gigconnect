// controllers/chatController.js
import asyncHandler from "express-async-handler";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";

// @desc    Get or create a chat between two users
// @route   POST /api/chats
// @access  Private
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("UserId param not sent with request");
  }

  let chat = await Chat.findOne({
    participants: { $all: [req.user._id, userId] },
  }).populate("participants", "-password");

  if (chat) {
    res.json(chat);
  } else {
    const newChat = await Chat.create({
      participants: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate(
      "participants",
      "-password"
    );

    res.status(201).json(fullChat);
  }
});

// @desc    Send a message in a chat
// @route   POST /api/chats/:chatId/message
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const { chatId } = req.params;

  if (!text) {
    res.status(400);
    throw new Error("Message content cannot be empty");
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  const newMessage = {
    sender: req.user._id,
    text,
  };

  chat.messages.push(newMessage);
  await chat.save();

  const updatedChat = await Chat.findById(chatId)
    .populate("participants", "-password")
    .populate("messages.sender", "name email");

  res.json(updatedChat);
});

// @desc    Get all messages in a chat
// @route   GET /api/chats/:chatId/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId)
    .populate("participants", "-password")
    .populate("messages.sender", "name email");

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  res.json(chat.messages);
});

const getUserChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    participants: req.user._id,
  })
    .populate("participants", "-password")
    .populate("messages.sender", "name email")
    .sort({ updatedAt: -1 });

  res.json(chats);
});


export { accessChat, sendMessage, getMessages, getUserChats  };
