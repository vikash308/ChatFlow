import axios from "axios";
import server from "../api.js";
import useConversation from "../zustand/useConversation.js";

const useDeleteMessage = () => {
    const { setMessage } = useConversation();
    const token = localStorage.getItem("jwt");

    const deleteForMe = async (messageId) => {
        await axios.delete(`${server}/api/message/delete-for-me/${messageId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

       
        setMessage((prev) => prev.filter((m) => m._id !== messageId));
    };

    const deleteForEveryone = async (messageId) => {
        await axios.delete(`${server}/api/message/delete-for-everyone/${messageId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

       
        setMessage((prev) =>
            prev.map((m) =>
                m._id === messageId
                    ? { ...m, isDeleted: true, message: "This message was deleted" }
                    : m
            )
        );
    };

    return { deleteForMe, deleteForEveryone };
};

export default useDeleteMessage;
