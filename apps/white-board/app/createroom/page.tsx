"use client";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateRoom(){
    const session = useSession();
    const router = useRouter();
    const [createRoomName, setCreateRoomName] = useState("");
    const [joinRoomName, setJoinRoomName] = useState("");


    if(session.status === "loading"){
        return <div>Loading...</div>;
    }
    
    if(session.status !== "authenticated"){
        router.push("/signin");
        return null;
    }

    const handleCreateRoomClick = async() => {
        try{
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/create-room`,
                { name: createRoomName },
                {
                    headers: {
                        Authorization: `Bearer ${session.data.accessToken}`
                    }
                }
            );

            if(response.status === 201){
                console.log(response.data);
                router.push(`/canvas/${response.data.roomSlug}`);
            }
        } catch(error){
            console.error("Failed to create room:", error);
        }
    }

    const handleJoinRoomClick = async() => {
        try{
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/room/${joinRoomName}`, {
                headers: {
                    Authorization: `Bearer ${session.data.accessToken}`
                }
            });
            if(response.data.roomId){
                router.push(`/canvas/${response.data.roomSlug}`);
            }
        } catch(error){
            console.error("Failed to join room:", error);
        }
    }


    return (
        <div>
            <input type={"text"} placeholder="Enter room name you want to create" value={createRoomName} onChange={(e) => setCreateRoomName(e.target.value)} />
            <button onClick={handleCreateRoomClick}>Create Room</button>

            <input type="text" placeholder="Enter room name you want to join" value={joinRoomName} onChange={(e) => setJoinRoomName(e.target.value)} />
            <button onClick={handleJoinRoomClick}>Join Room</button>
        </div>
    )
}