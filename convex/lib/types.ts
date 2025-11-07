import type { Doc } from "../auth/_generated/dataModel";

export type AuthUser = Doc<"user">;

export interface AuthenticatedUser extends Omit<AuthUser, "userId"> {
  userId: string;
}

export interface AdminUser extends Omit<AuthUser, "userId" | "role"> {
  userId: string;
  role: "ADMIN";
}

export interface LearnerUser extends Omit<AuthUser, "userId" | "role"> {
  userId: string;
  role: "LEARNER";
}

export interface FacultyUser extends Omit<AuthUser, "userId" | "role"> {
  userId: string;
  role: "FACULTY" | "ADMIN";
}

export type UserRole = "ADMIN" | "LEARNER" | "FACULTY";