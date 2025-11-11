import {
  createClient,
  type AuthFunctions,
  type GenericCtx
} from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { components, internal } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import authSchema from "./auth/schema";

const siteUrl = process.env.SITE_URL || "http://localhost:5173";

const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.auth,
  {
    authFunctions,
    local: {
        schema: authSchema
    },
  }
);

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    logger: { disabled: optionsOnly },
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "LEARNER",
          input: false
        },
        image: {
          type: "string",
          required: false
        },
        institution: {
          type: "string",
          required: false
        },
        bio: {
          type: "string",
          required: false
        },
        isDeactivated: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false
        }
      }
    },
    plugins: [
      crossDomain({ siteUrl }),
      convex()
    ]
  });
};
