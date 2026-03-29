"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [slug, setSlug] = useState("");
  const router = useRouter();
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