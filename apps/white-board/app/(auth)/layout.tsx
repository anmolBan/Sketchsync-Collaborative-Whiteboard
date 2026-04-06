import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if(session?.user) {
        redirect("/"); // User is already authenticated, redirect to home page
    }
    return (
        <div>
            {children}
        </div>
    )
}