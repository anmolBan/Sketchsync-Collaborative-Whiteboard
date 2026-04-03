import { z } from "zod";

export const UserSignupSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string()
});

export type UserSignupInput = z.infer<typeof UserSignupSchema>;

export const UserSigninSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type UserSigninInput = z.infer<typeof UserSigninSchema>;

export const UserOAuthSigninSchema = z.object({
  name: z.string(),
  email: z.string().email()
});

export type UserOAuthSigninInput = z.infer<typeof UserOAuthSigninSchema>;

export const CreateRoomSchema = z.object({
  name: z.string()
});

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
