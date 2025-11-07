import { z } from "zod";

export const platformRoles = z.enum([
  "LEARNER",
  "FACULTY",
  "ADMIN",
]);
export type Role = z.infer<typeof platformRoles>;

export const authenticateModes = z.enum([
  "signin",
  "signup",
]);
export type Mode = z.infer<typeof authenticateModes>;
