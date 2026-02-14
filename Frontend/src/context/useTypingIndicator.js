import { useEffect } from "react";
import { useSocketContext } from "./SocketContext";
import useConversation from "../zustand/useConversation";

const useTypingIndicator = () => {
    const { socket } = useSocketContext();
    const { selectedConversation, setTypingUser } = useConversation();

    useEffect(() => {
        if (!socket) return;

        const onTyping = () => {
            setTypingUser(true);
        };

        const onStopTyping = () => {
            setTypingUser(false);
        };

        socket.on("typing", onTyping);
        socket.on("stopTyping", onStopTyping);

        return () => {
            socket.off("typing", onTyping);
            socket.off("stopTyping", onStopTyping);
        };
    }, [socket, setTypingUser]);

    useEffect(() => {
        setTypingUser(false);
    }, [selectedConversation, setTypingUser]);
};

export default useTypingIndicator;
