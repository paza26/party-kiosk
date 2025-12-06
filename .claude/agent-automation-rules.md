# Agent Automation Rules

This file defines MANDATORY rules for when agents MUST be invoked automatically.

## CRITICAL: Git Operations - ALWAYS use git-workflow-manager

**RULE:** ANY Git operation MUST be delegated to `git-workflow-manager`

**Trigger Keywords:**
- git add, commit, push, pull, merge, branch, checkout, tag, rebase, cherry-pick
- "commit this", "push changes", "create PR", "merge to main"
- "staging", "committing", "version control"

**Examples:**
```
User: "commit these changes"
→ MUST invoke git-workflow-manager

User: "create a PR for this feature"
→ MUST invoke git-workflow-manager

User: "push to remote"
→ MUST invoke git-workflow-manager

Assistant doing git operations directly
→ WRONG! MUST invoke git-workflow-manager instead
```

**Why:** git-workflow-manager has exclusive authority over Git operations and knows best practices for commits, branching, and CI/CD.

---

## CRITICAL: Documentation - ALWAYS use code-documentation-specialist

**RULE:** ANY significant documentation task (>10 min effort) MUST be delegated to `code-documentation-specialist`

**Trigger Keywords:**
- "document this", "update README", "write docs", "create documentation"
- "add JSDoc", "API documentation", "explain this code"
- Working with files in docs/, README.md, or documentation markdown

**Examples:**
```
User: "optimize the documentation"
→ MUST invoke code-documentation-specialist

User: "check the README and improve it"
→ MUST invoke code-documentation-specialist

Assistant writing documentation directly
→ If significant (>10 min), MUST invoke code-documentation-specialist
```

**Why:** code-documentation-specialist enforces minimal, English-only, essential documentation philosophy.

---

## Implementation Code - ALWAYS use react-native-architect

**RULE:** ANY React Native component implementation MUST be delegated to `react-native-architect`

**Trigger Keywords:**
- "implement component", "create screen", "add feature"
- "refactor to hooks", "migrate API", "fix platform issue"
- Working with .tsx/.jsx files in src/components/ or src/screens/

**Examples:**
```
User: "create a new Button component"
→ MUST invoke react-native-architect

User: "this component doesn't work on Android"
→ MUST invoke react-native-architect

User: "migrate this to modern React Native"
→ MUST invoke react-native-architect
```

**Why:** react-native-architect ensures cross-platform compatibility and modern best practices.

---

## Testing - ALWAYS use react-native-test-engineer

**RULE:** ANY test creation/modification MUST be delegated to `react-native-test-engineer`

**Trigger Keywords:**
- "test this", "write tests", "add coverage"
- "create unit tests", "integration tests"
- Working with files in __tests__/ or .test.ts files

**Examples:**
```
User: "write tests for this hook"
→ MUST invoke react-native-test-engineer

User: "we need test coverage for the auth flow"
→ MUST invoke react-native-test-engineer

After implementing feature
→ SHOULD proactively suggest react-native-test-engineer
```

**Why:** react-native-test-engineer knows testing best practices and proper test structure.

---

## UX Analysis - ALWAYS use ui-ux-senior-analyst

**RULE:** ANY UX/design evaluation MUST be delegated to `ui-ux-senior-analyst`

**Trigger Keywords:**
- "review this UI", "does this look good", "is this user-friendly"
- "navigation flow", "user experience", "accessibility"
- "responsive design", "mobile vs tablet"

**Examples:**
```
User: "review the checkout screen design"
→ MUST invoke ui-ux-senior-analyst

User: "is the navigation intuitive?"
→ MUST invoke ui-ux-senior-analyst

User: "does this work well on tablet?"
→ MUST invoke ui-ux-senior-analyst
```

**Why:** ui-ux-senior-analyst provides expert UX heuristics evaluation.

---

## Decision Matrix

| Task Type | Agent | When to Invoke |
|-----------|-------|----------------|
| **Git operations** | git-workflow-manager | ALWAYS (100%) |
| **Documentation** | code-documentation-specialist | If effort >10 min |
| **React Native code** | react-native-architect | For implementation |
| **Testing** | react-native-test-engineer | For test files |
| **UX review** | ui-ux-senior-analyst | For design evaluation |

---

## Enforcement

**Main Assistant (Claude Code) MUST:**
1. Check task type against this matrix
2. Invoke appropriate agent if match found
3. NEVER do Git operations directly - ALWAYS delegate
4. NEVER write significant docs directly - delegate
5. For multi-step tasks, invoke multiple agents in sequence

**Example Multi-Agent Flow:**
```
User: "Add a new payment feature and test it"

Step 1: Invoke react-native-architect → implement feature
Step 2: Invoke react-native-test-engineer → create tests
Step 3: Invoke git-workflow-manager → commit changes
```

---

## Override Cases

Agent invocation can be skipped ONLY when:
- Task is trivial (<2 min, like reading a file)
- User explicitly says "do it yourself, don't use agents"
- Emergency bug fix requiring immediate action

Otherwise: **USE THE AGENTS!**
