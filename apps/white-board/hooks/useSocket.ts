import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

export function useSocket(){
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { data: session, status } = useSession();
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if(status === "loading") return;
        
        const token = session?.accessToken;
        if(!token){
            setLoading(false);
            return;
        }

        // Don't create a new socket if one is already open/connecting
        if(socketRef.current && 
           (socketRef.current.readyState === WebSocket.OPEN || 
            socketRef.current.readyState === WebSocket.CONNECTING)){
            return;
        }
        
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`);
        socketRef.current = ws;

        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
        
        return () => {
            if(ws.readyState === WebSocket.OPEN){
                ws.close();
                socketRef.current = null;
            }
        }
    }, [session?.accessToken, status]);

    return { loading, socket };
}