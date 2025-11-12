import { mutation } from "./_generated/server";

export default mutation({
  handler: async (ctx) => {
    const tables = ["assignments", "quizzes", "lessons", "modules"];

    for (const table of tables) {
      const docs = await ctx.db.query(table as any).collect();
      for (const doc of docs) {
        if (doc.status !== "pending") {
          await ctx.db.patch(doc._id, { status: "pending" });
        }
      }
    }

    return "All statuses in assignments, quizzes, lessons, and modules set to pending.";
  },
});
