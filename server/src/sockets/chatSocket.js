function registerChatHandlers(io) {
  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    socket.on("join_conversation", (conversationId) => {
      console.log("🟢 join_conversation:", conversationId, "by", socket.id);
      socket.join(conversationId);
    });

    socket.on("send_message", (payload) => {
      console.log("💬 send_message from", socket.id, payload);

      const { conversationId, text, senderId } = payload;

      const message = {
        _id: Date.now().toString(),
        conversationId,
        senderId,
        text,
        createdAt: new Date().toISOString(),
      };

      // broadcast to room
      io.to(conversationId).emit("receive_message", message);
    });

    socket.on("typing", ({ conversationId, userId }) => {
      console.log("✏️ typing:", conversationId, "by", userId);
      socket.to(conversationId).emit("typing", { userId });
    });

    socket.on("stop_typing", ({ conversationId, userId }) => {
      console.log("🛑 stop_typing:", conversationId, "by", userId);
      socket.to(conversationId).emit("stop_typing", { userId });
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
}

module.exports = registerChatHandlers;
