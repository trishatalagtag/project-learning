import {
    createClient,
    type GenericCtx
} from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import authSchema from "./auth/schema";

const siteUrl = process.env.SITE_URL || "http://localhost:5173";

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.auth,
  {
    local: {
        schema: authSchema
    }
  }
);

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
        }
      }
    },
    plugins: [
      crossDomain({ siteUrl }),
      convex()
    ]
  });
};
