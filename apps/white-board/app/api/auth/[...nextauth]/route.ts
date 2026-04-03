import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);

// Next.js 15+ makes route-handler `params` a Promise, but next-auth v4
// reads params.nextauth synchronously.  Unwrap before forwarding.
async function unwrapHandler(
  req: Request,
  ctx: { params: Promise<{ nextauth: string[] }> }
) {
  return handler(req, { params: await ctx.params });
}

export { unwrapHandler as GET, unwrapHandler as POST };