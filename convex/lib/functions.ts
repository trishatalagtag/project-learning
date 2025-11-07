import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { action, mutation, query } from "../_generated/server";
import { 
  requireAuthWithUserId, 
  requireAdmin, 
  requireLearner, 
  requireFacultyOrAdmin 
} from "./auth";

export const authenticatedQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await requireAuthWithUserId(ctx);
    return { user };
  })
);

export const authenticatedMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await requireAuthWithUserId(ctx);
    return { user };
  })
);

export const authenticatedAction = customAction(
  action,
  customCtx(async (ctx) => {
    const user = await requireAuthWithUserId(ctx);
    return { user };
  })
);

export const adminQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await requireAdmin(ctx);
    return { user };
  })
);

export const adminMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await requireAdmin(ctx);
    return { user };
  })
);

export const adminAction = customAction(
  action,
  customCtx(async (ctx) => {
    const user = await requireAdmin(ctx);
    return { user };
  })
);

export const facultyQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await requireFacultyOrAdmin(ctx);
    return { user };
  })
);

export const facultyMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await requireFacultyOrAdmin(ctx);
    return { user };
  })
);

export const facultyAction = customAction(
  action,
  customCtx(async (ctx) => {
    const user = await requireFacultyOrAdmin(ctx);
    return { user };
  })
);

export const learnerQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await requireLearner(ctx);
    return { user };
  })
);

export const learnerMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await requireLearner(ctx);
    return { user };
  })
);

export const learnerAction = customAction(
  action,
  customCtx(async (ctx) => {
    const user = await requireLearner(ctx);
    return { user };
  })
);

export const publicQuery = query;
export const publicMutation = mutation;
export const publicAction = action;