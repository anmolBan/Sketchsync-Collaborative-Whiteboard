import axios from "axios";
import { NextResponse } from "next/server";
import { BACKEND_URL} from "@repo/backend_common";

export async function POST(req: Request) {
    try{
        const { email, password } = await req.json();
        const res = await axios.post(`${BACKEND_URL}/api/users/signin`, {
            email,
            password,
        });
        const { token } = res.data;

        // set token in cookie with 7 days expiration
        const response = NextResponse.json({ message: "Signin successful.", token });
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
            path: "/"
        });
        return response;
    } catch(error){
        return NextResponse.json({ message: "Signin failed.", error: error instanceof Error ? error.message : "Unknown error" }, { status: 401 });
    }
}
