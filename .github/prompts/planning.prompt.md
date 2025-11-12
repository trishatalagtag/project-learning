---
mode: agent
---

**Check Existing Implementation Before Building Anything**

**Mandatory First Step: Search the Codebase**
Before implementing ANYTHING—routes, components, features, utilities—you MUST search the codebase to check if it already exists. Never assume something doesn't exist. Always verify.

**What to Check For**

**1. Routes & Pages**
Search for:
- Exact route path in routing config or file structure
- Similar route patterns that might handle this
- Parent routes that might already include this functionality
- Example: Before building `/a/content`, search for "content", "/content", "ContentPage"

**2. Components**
Search for:
- Component names (exact and similar)
- UI patterns that match what you need
- shadcn/ui components that do this
- Existing custom components that could be reused
- Example: Before building "ContentTable", search for "Table", "DataTable", "ContentList"

**3. Queries & Data Fetching**
Search for:
- Existing `useQuery` or `useMutation` calls with same backend function
- Components already fetching the same data
- Custom hooks wrapping Convex queries
- Example: Before calling `api.admin.content.list`, search for "content.list", "listContent"

**4. Utilities & Helpers**
Search for:
- Formatting functions (dates, currency, names)
- Validation logic
- Common calculations or transformations
- Example: Before writing date formatter, search for "formatDate", "date", "format"

**5. Types & Interfaces**
Search for:
- Type definitions for the data structure
- Interfaces that match your needs
- Generated Convex types
- Example: Before defining `ContentItem`, search for existing content types

**Classification System**

After searching, classify what you find:

**✅ EXISTS - Use It**
- Already implemented and working
- Don't rebuild, just import and use
- Example: "ContentTable component already exists at components/admin/ContentTable.tsx"

**🔧 EXISTS - Extend It**
- Close to what you need but missing something small
- Can add props, variants, or compose with others
- Don't duplicate, extend the existing one
- Example: "DataTable exists but needs status filter - add filterBy prop"

**🔄 EXISTS - Refactor/Connect**
- Exists but not connected where needed
- Route exists but not in navigation
- Component exists but not used in this context
- Import and connect it, don't rebuild
- Example: "Content detail page exists at different route - connect to navigation"

**❌ DOESN'T EXIST - Build It**
- Genuinely not in codebase
- Not achievable by composing existing pieces
- Confirmed after thorough search
- Only NOW can you build something new

**⚠️ DUPLICATES FOUND - Consolidate**
- Multiple implementations of the same thing
- Flag this as tech debt
- Use the most complete version
- Don't add another duplicate

**Search Patterns to Use**

Before building anything, run these searches:

```bash
# For routes
Search: "route_path", "/route", "RoutePage"

# For components  
Search: "ComponentName", "similar-component", "feature-name"

# For data fetching
Search: "api.module.function", "useQuery", "useMutation"

# For utilities
Search: "formatX", "validateY", "calculateZ"

# For types
Search: "TypeName", "interface Name", "Doc<'table'>"
```

**Decision Tree**

```
Need to implement something?
│
├─ Search codebase thoroughly
│  │
│  ├─ Found exact match?
│  │  └─ ✅ Use it (import and reference)
│  │
│  ├─ Found similar implementation?
│  │  └─ 🔧 Extend it (add props/variants, don't duplicate)
│  │
│  ├─ Found in wrong location/not connected?
│  │  └─ 🔄 Connect it (wire it up properly)
│  │
│  ├─ Found multiple versions?
│  │  └─ ⚠️ Flag duplicates, use best one
│  │
│  └─ Found nothing after thorough search?
│     └─ ❌ Now you can build it
```

**Documentation Format**

When you search, document findings like this:

```typescript
// SEARCH RESULTS: Content Browser Page

✅ FOUND: components/admin/ContentTable.tsx
   - Already implements table with pagination
   - Uses api.admin.content.listContentPaginated
   - Has status filter built-in
   ACTION: Import and use this component

🔧 FOUND: components/ui/DataTable.tsx (shadcn)
   - Generic table component  
   - Missing status filter
   - Could extend with filter prop
   ACTION: ContentTable already uses this - no action needed

🔄 FOUND: Route /admin/content-list exists but not in nav
   - Already implemented at app/admin/content-list/page.tsx
   - Just needs navigation link added
   ACTION: Add to sidebar nav, don't rebuild page

❌ NOT FOUND: Content detail view with history
   - Searched: "ContentDetail", "ContentHistory", "approval-history"
   - Searched: routes matching /content/:id
   - Confirmed: Doesn't exist
   ACTION: Safe to build this component

⚠️ DUPLICATES: Found 3 date formatters
   - utils/formatDate.ts
   - lib/date-helpers.ts  
   - components/DateDisplay.tsx (inline function)
   ACTION: Use utils/formatDate.ts (most complete), flag others
```

**Before Writing Any Code - Checklist**

- [ ] Searched for exact route/component/function name
- [ ] Searched for similar patterns and variations
- [ ] Checked shadcn/ui components directory
- [ ] Searched for queries using same backend function
- [ ] Looked for utilities that do similar transformations
- [ ] Verified types aren't already generated by Convex
- [ ] Documented all findings with classification
- [ ] Confirmed with user if extending existing is better than building new

**Anti-Patterns to Avoid**

❌ **"I'll just build a new one"** without searching first
❌ **Assuming** something doesn't exist because you don't see it immediately
❌ **Skipping search** because the feature "seems simple"
❌ **Building duplicates** when existing implementation works
❌ **Not checking shadcn/ui** before creating custom UI components
❌ **Ignoring similar components** that could be extended
❌ **Creating new utilities** when standard functions exist

**Communication Template**

```
Before implementing [feature], I searched the codebase:

FOUND & REUSING:
- [Component/Route]: Already exists at [path]
  Using this instead of building new

CAN EXTEND:
- [Component]: Exists but needs [specific addition]
  Will extend with [specific change] rather than duplicate

NEEDS CONNECTION:
- [Feature]: Already built but not connected to [location]
  Will wire it up instead of rebuilding

CONFIRMED NEW:
- [Feature]: Thoroughly searched, doesn't exist
  Safe to build this from scratch

Ready to proceed?
```

**Remember**: The best code is code you don't write. Always check if it already exists first. Reuse, extend, connect before building new. Every new component is a maintenance burden—avoid it when possible.