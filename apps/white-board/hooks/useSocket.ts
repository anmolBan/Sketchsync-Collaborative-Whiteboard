"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useSocket(){
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    const session = useSession();
    
    const token = session.data?.accessToken;
    
    if(!token){
        setLoading(false);
        return { loading, socket };
    }
    useEffect(() => {
        const ws = new WebSocket(`${process.env.WS_URL}?token=${token}`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, [token]);

    return { loading, socket };
}