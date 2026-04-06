import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useSocket(){
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { data: session } = useSession();

    useEffect(() => {
        const token = session?.accessToken;
        if(!token){
            setLoading(false);
            return;
        }
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
        return () => {
            ws.close();
        }
    }, [session?.accessToken]);

    return { loading, socket };
}