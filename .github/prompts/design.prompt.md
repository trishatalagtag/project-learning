---
mode: agent
---

---
alwaysApply: true
---

Here's the updated Cursor rule with shadcn/ui awareness and duplicate prevention:

---

**Design System & UX/UI Consistency**

**Primary Design System: shadcn/ui**
This project uses shadcn/ui as the foundation. ALWAYS review the existing shadcn/ui components in `components/ui/` before building anything new. shadcn/ui provides high-quality, accessible components that should be your first choice.

**Before Creating Anything New - Mandatory Checks**
1. **Search existing components**: Check `components/ui/` for shadcn/ui components that solve your need
2. **Check for duplicates**: Search the codebase for similar implementations that already exist
3. **Evaluate extension options**: If a component is close but not exact, determine if you can:
   - Extend it with additional props or variants
   - Compose it with other existing components
   - Create a wrapper component that adds specific behavior
4. **Only create new** when no existing solution works and composition is impossible

**shadcn/ui Component Usage**
- Use shadcn/ui components as-is when they meet requirements
- Extend shadcn/ui components using the `className` prop and `cn()` utility for variants
- Create composed components that combine multiple shadcn/ui primitives
- Never duplicate shadcn/ui component logic—always import and extend

**Avoiding Duplicate Implementations**
Before writing any component:
```
1. Does shadcn/ui have this? → Use it
2. Does our codebase have this? → Use or extend it
3. Can I compose existing components? → Compose them
4. Must I create something new? → Ensure it's truly unique
```

Common duplicates to avoid:
- Multiple button variants when shadcn/ui Button already exists
- Custom input components when shadcn/ui Input can be extended
- Reinvented modals, dialogs, dropdowns, tooltips, or popovers
- Custom form components when shadcn/ui Form + React Hook Form is available

**Core Principle**
Maintain visual and interaction consistency across the application. Every component, layout, and interaction must follow established patterns. The hierarchy is: shadcn/ui → existing custom components → composition → new component (last resort).

**Design Tokens - Always Use, Never Hardcode**
- Colors: Use Tailwind/shadcn theme variables (`bg-background`, `text-foreground`, `border-input`)
- Spacing: Use Tailwind spacing scale (`space-y-4`, `gap-6`, `p-8`) never arbitrary values
- Typography: Use Tailwind text utilities (`text-sm`, `text-lg`, `font-medium`) consistently
- Breakpoints: Use Tailwind responsive prefixes (`md:`, `lg:`, `xl:`)

**Component Standards**
- shadcn/ui components are already accessible—don't break this
- When extending shadcn/ui, maintain their prop patterns and interaction behaviors
- New composed components must match shadcn/ui's interaction patterns (hover, focus, disabled states)
- Keep component APIs minimal but complete—guide correct usage, prevent breaking consistency

**Layout & Spacing Rules**
- Follow Tailwind spacing scale rigorously—same spacing for same contexts everywhere
- Use mobile-first responsive approach with Tailwind breakpoints
- Maintain consistent spatial relationships (header-to-content gap, card padding, etc.)
- Use shadcn/ui layout primitives (Card, Separator, etc.) for consistency

**Interaction & Feedback**
- Similar actions must behave identically—reuse shadcn/ui interaction patterns
- Provide immediate visual feedback for all interactions
- Use shadcn/ui Skeleton for loading states, not custom spinners
- Use shadcn/ui Alert, Toast, or inline error patterns for feedback
- Error messages appear inline near relevant fields, written in user-friendly language

**Accessibility Requirements**
- shadcn/ui handles most accessibility—don't override or break it
- All custom interactive elements must be keyboard navigable with visible focus states
- Never use color alone to convey meaning—include icons, labels, or patterns
- Text must meet WCAG contrast ratios (shadcn/ui theme ensures this)
- Custom components must handle focus management like shadcn/ui does

**Anti-Patterns to Reject**
- ❌ Reimplementing shadcn/ui components from scratch
- ❌ Creating duplicate components when existing ones work
- ❌ Hardcoded colors instead of theme variables
- ❌ Arbitrary Tailwind values (`h-[47px]`) instead of scale values
- ❌ Inconsistent interaction patterns from shadcn/ui standards
- ❌ Inaccessible custom components that ignore shadcn/ui patterns
- ❌ Using inline styles to override design system
- ❌ Different loading/error states when shadcn/ui provides standard ones

**When Making Design Decisions**
Ask in order:
1. Does shadcn/ui have this? → Use it
2. Does a similar component exist in our codebase? → Use or extend it  
3. Can I compose existing components? → Compose them
4. Can I extend shadcn/ui with variants? → Extend it
5. Must I create something entirely new? → Validate it's truly unique and document why

**Finding Existing Components**
Search patterns to use before creating:
- `components/ui/` - shadcn/ui components
- `components/` - custom shared components
- Search for similar names: "modal", "dialog", "form", "input", "button", "card"
- Check similar features for reusable patterns
