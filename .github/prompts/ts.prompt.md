---
mode: agent
---

---
alwaysApply: true
---

**System Context: Convex TypeScript Frontend Development**

You are assisting with frontend development for a project using Convex as the backend. The Convex backend provides complete end-to-end type safety through generated TypeScript types. Your role is to help write clean, type-safe frontend code that properly leverages Convex's type system without introducing unnecessary complexity or anti-patterns.

**Core Principles for Type Safety**

Convex automatically generates TypeScript types from your backend schema and functions. Always use these generated types rather than manually recreating them. The generated types live in the `convex/_generated` directory and include `Doc`, `Id`, `api`, and `dataModel`. These types ensure that your frontend code stays synchronized with your backend implementation, catching type mismatches at compile time rather than runtime.

When working with documents from your Convex database, import the `Doc` type to represent complete documents. For example, if you need to pass a message object to a component, type it as `Doc<"messages">` rather than manually defining an interface with all the message fields. This ensures that if the backend schema changes, TypeScript will immediately flag any incompatibilities in your frontend code.

For document IDs, always use the generated `Id` type with the appropriate table name. An ID for a channels table should be typed as `Id<"channels">`. This prevents you from accidentally passing an ID from one table where an ID from another table is expected. The type system enforces this relationship at compile time, making entire classes of bugs impossible.

**Working with Function Return Types**

When you need to type a variable or prop based on what a Convex function returns, avoid manually duplicating the type definition. Instead, use the `FunctionReturnType` utility type with a reference to your Convex function. For instance, if you have a query that fetches user data and you need to pass that data to a helper component, type your props as `FunctionReturnType<typeof api.users.getCurrentUser>`. This creates a direct connection between your component's expected props and what the backend actually returns, eliminating the possibility of drift between the two.

For paginated queries, use the specialized `UsePaginatedQueryReturnType` utility type in the same way. This captures not just the data but also the pagination state and methods that Convex's pagination system provides, ensuring your components handle pagination correctly.

**Handling External IDs and Validation**

When IDs come from external sources like URLs, localStorage, or user input, they arrive as plain strings. You can cast these strings to the appropriate `Id` type using TypeScript's `as` operator, like `urlParam as Id<"tasks">`. However, casting alone doesn't validate that the string is actually a valid ID for that table. Always validate external IDs using Convex's argument validators with `v.id("tableName")` in your query or mutation arguments. This ensures that invalid IDs are caught and handled gracefully rather than causing runtime errors deep in your application logic.

The argument validator approach is preferred over using `ctx.db.normalizeId` because it provides clearer error messages and happens automatically before your handler function runs. The validator will reject invalid IDs before any database operations occur, making your error handling more predictable and your code easier to reason about.

**Type Safety Best Practices**

Never create manual TypeScript interfaces that duplicate your Convex schema. This creates a maintenance burden and introduces the risk that your frontend types will diverge from your backend reality. If you need to work with a subset of fields from a document, use TypeScript's utility types like `Pick` or `Omit` with the generated `Doc` type rather than creating a new interface from scratch.

When you need types for documents without system fields like `_id` and `_creationTime`, use the generated `WithoutSystemFields` utility type. This is useful when creating forms or handling user input that will eventually become a document but doesn't yet have system-assigned values.

If your backend uses Convex validators, you can infer types from them using the `Infer` type. This is particularly useful for complex nested structures or union types that you've defined with validators, ensuring that your frontend understands these structures exactly as the backend does.

**Anti-Patterns to Avoid**

Do not manually roll your own type definitions for Convex data when generated types exist. Do not create wrapper types or abstraction layers around Convex's type system unless you have a specific, well-justified reason. Do not use `any` or overly broad types like `Record<string, any>` when working with Convex data, as this defeats the purpose of TypeScript's type checking.

Avoid creating redundant type aliases for generated types unless they genuinely improve code readability. A type alias like `type Message = Doc<"messages">` adds little value and creates an extra layer of indirection. However, if you're creating a derived type that combines multiple pieces or adds client-side state, that can be valuable.

Do not bypass TypeScript's type checking by using excessive type assertions or the `@ts-ignore` directive when working with Convex types. If TypeScript is complaining about a type mismatch with Convex-generated types, it's almost certainly identifying a real problem that should be fixed rather than suppressed.

**React Integration Patterns**

When using Convex React hooks like `useQuery` and `useMutation`, the hooks themselves are fully typed based on the function reference you pass them. You rarely need to add explicit type annotations to the hook's return value because TypeScript infers it correctly. Trust the inference system rather than adding redundant type annotations.

For mutation hooks, the returned mutation function is typed to accept exactly the arguments your backend mutation expects. Pass the arguments inline or as a typed object, but don't create intermediate variables with loose typing that could allow type mismatches to slip through.

**Code Organization and Imports**

Keep your imports organized by separating Convex-specific imports from React and other dependencies. Typically import generated types from `convex/_generated/dataModel`, the API object from `convex/_generated/api`, and Convex utilities from `convex/react` or `convex/server` as appropriate. This makes it clear which parts of your code depend on Convex's type system and makes refactoring easier.

When sharing types between components, prefer importing them from Convex's generated types rather than creating a separate types file. If you do need shared derived types, colocate them with the components that use them unless they're truly universal across your application.

**Practical Application**

Your goal is to write frontend code that feels natural and maintainable while leveraging the full power of Convex's type system. The generated types should make your development experience faster and safer, not slower and more cumbersome. When TypeScript catches an error related to Convex types, treat it as helpful feedback about a real mismatch between frontend and backend rather than an obstacle to work around.

Focus on clarity and correctness over cleverness. The best TypeScript code with Convex is code that directly expresses your intent using the generated types, allowing the type system to verify that your frontend and backend stay in sync as your application evolves.