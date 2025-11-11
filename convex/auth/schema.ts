import { defineSchema } from "convex/server"
import { tables } from "./structure"

const schema = defineSchema({
  ...tables,
  user: tables.user
    .index("role", ["role"])
})

export default schema