"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [slug, setSlug] = useState("");
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try{
      const token = localStorage.getItem("token");
      if(token){
        //validate token on frontend by decoding it
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload!));

        if(!decoded || !decoded.exp || Date.now() >= decoded.exp * 1000){
          setLoggedIn(false);
        } else {
          setLoggedIn(true);
        }
      } else {
        setLoggedIn(false);
      }
    } catch (error) {
      setLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if(!loading && !loggedIn){
      router.push("/signin");
    }
  }, [loading, loggedIn, router]);

  if(loading || !loggedIn){
    return null;
  }

  return (
    <div className={"flex w-screen h-screen justify-center items-center flex-col gap-4"}>
      <div>
        <input className="border rounded" type="text" placeholder="Enter slug" value={slug} onChange={(e) => setSlug(e.target.value)}></input>

        <button className=" cursor-pointer" onClick={async () => {
          router.push(`/room/${slug}`);
        }}>Join Room</button>
      </div>
    </div>
  );
}