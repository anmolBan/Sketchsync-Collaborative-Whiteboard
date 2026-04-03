import axios from "axios";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3002";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    const res = await axios.post(`${BACKEND_URL}/api/users/signup`, {
      name,
      email,
      password,
    });
    return NextResponse.json(res.data, { status: 201 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status  = error.response?.status  ?? 500;
      const message = error.response?.data?.message ?? "Signup failed";
      return NextResponse.json({ message }, { status });
    }
    return NextResponse.json({ message: "Signup failed" }, { status: 500 });
  }
}
