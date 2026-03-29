"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({chats, roomId} : {
    chats: { message: string, userId: string, timestamp: string }[],
    roomId: string
}){
    const [messages, setMessages] = useState(chats)
    const {socket, loading} = useSocket();

    useEffect(() => {
        if(socket && !loading){

            socket.send(JSON.stringify({
                action: "join",
                roomId
            }));

            socket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);
                if(parsedData.type === "message" && parsedData.roomId === roomId){
                    // Update your chat messages state here with the new message
                    setMessages(prevMessages => [...prevMessages, {
                        userId: parsedData.userId,
                        message: parsedData.content,
                        timestamp: parsedData.timestamp
                    }]);
                    console.log("New message received:", parsedData.content);
                } else if(parsedData.type === "join" && parsedData.roomId === roomId){
                    console.log("A new user joined the room:", parsedData.userId);
                } else if(parsedData.type === "user-left" && parsedData.roomId === roomId){
                    console.log("A user left the room:", parsedData.userId);
                }
            }
        }
    }, [socket, loading]);

    return (
        <div>
            {messages.map((msg, index) => (
                <div key={index}>
                    <strong>{msg.userId}</strong>: {msg.message} <em>({new Date(msg.timestamp).toLocaleTimeString()})</em>
                </div>
            ))}
        </div>
    )
}