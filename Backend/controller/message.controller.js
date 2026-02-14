import { getReceiverSocketId, io } from "../SocketIO/server.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";



export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id; // current logged in user
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverId],
      });
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });
    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }
    // await conversation.save()
    // await newMessage.save();
    await Promise.all([conversation.save(), newMessage.save()]); // run parallel
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { id: chatUser } = req.params;
    const senderId = req.user._id; // current logged in user
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, chatUser] },
    }).populate("messages");
    if (!conversation) {
      return res.status(201).json([]);
    }
    const messages = conversation.messages;
    res.status(201).json(messages);
  } catch (error) {
    console.log("Error in getMessage", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ error: "Message not found" });

   
    const isAllowed =
      msg.senderId.toString() === userId.toString() ||
      msg.receiverId.toString() === userId.toString();

    if (!isAllowed) return res.status(403).json({ error: "Not allowed" });

    
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: userId },
    });

    return res.json({ success: true, messageId });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};


export const deleteForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ error: "Message not found" });

    
    if (msg.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only sender can delete for everyone" });
    }

    msg.isDeleted = true;
    msg.message = "This message was deleted";
    await msg.save();

   
    const receiverSocketId = getReceiverSocketId(msg.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", {
        messageId,
        deleteType: "everyone",
      });
    }

    
    const senderSocketId = getReceiverSocketId(msg.senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDeleted", {
        messageId,
        deleteType: "everyone",
      });
    }

    return res.json({ success: true, messageId });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};


