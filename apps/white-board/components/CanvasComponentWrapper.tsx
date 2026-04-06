import CanvasComponent from "./CanvasComponent";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import axios from "axios";

async function fetchCanvasData(roomId: string, token: string): Promise<any>{
    try{
        const response = await axios.get(`${process.env.BACKEND_URL}/api/users/canvasData/${roomId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if(response.status === 200){
            return response.data;
        }
    } catch (error) {
        console.error("Error fetching canvas data:", error);
    }
}

export default async function CanvasComponentWrapper({roomId, roomName}: {roomId: string, roomName: string}) {
    const session = await getServerSession(authOptions);
    if(!session || !session.accessToken){
        redirect("/signin");
    }
    const token = session.accessToken;

    // TODO handle case where roomID is invalid or null (e.g., show error message or redirect)
    if(!roomId){
        redirect("/");
    }
    const canvasData = await fetchCanvasData(roomId, token);
    return (
        <div>
            <CanvasComponent roomId={roomId} roomName={roomName} canvasData={canvasData} />
        </div>
    )
}