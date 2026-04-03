import { BACKEND_URL } from "../config"
import axios from "axios"
import { ChatRoomClient } from "./ChatRoomClient";
import { cookies } from "next/headers";

async function getChats(roomId: string): Promise<{userId: string, name: string, message: string, timestamp: string}[]> {
    try{
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const response = await axios.get(`${BACKEND_URL}/api/users/chats/${roomId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if(response.status === 200){
            return response.data.chats;
        } else {
            return [];
        }
    } catch (error) {
        return Promise.reject(error instanceof Error ? error.message : "Unknown error");
    }
}

export async function ChatRoom({roomId, slug} : {
    roomId: string,
    slug: string
}){
    const messages = await getChats(roomId);

    return (
        <div>
            <ChatRoomClient roomId={roomId} chats={messages} slug={slug} />
        </div>
    )
}