# Claude Configuration

This directory contains Claude Code configuration and custom agents.

## Structure

```
.claude/
├── settings.local.json          # Local settings (gitignored)
├── agent-automation-rules.md    # Rules for automatic agent invocation
└── agents/                      # Custom specialized agents
    ├── git-workflow-manager.md
    ├── code-documentation-specialist.md
    ├── react-native-architect.md
    ├── react-native-test-engineer.md
    └── ui-ux-senior-analyst.md
```

## Agents

All agents use `haiku` model for token efficiency.

### git-workflow-manager
**Exclusive authority** over all Git and CI/CD operations.
- Commits, branches, merges, PRs
- CI/CD workflows
- Release management

### code-documentation-specialist
**Minimal documentation** philosophy - English only, essential info.
- Project documentation
- API docs
- README files

### react-native-architect
**Technical implementation** for React Native.
- Component implementation
- Cross-platform code
- Modern API migrations

### react-native-test-engineer
**Testing specialist** for Jest and React Testing Library.
- Unit tests
- Integration tests
- Test coverage

### ui-ux-senior-analyst
**UX evaluation** and design recommendations.
- Interface analysis
- Navigation flows
- Accessibility review

## Agent Invocation

See `agent-automation-rules.md` for detailed rules on when each agent is automatically invoked.

**Key principle:** Agents have exclusive domains. Main assistant delegates to specialists.

## Token Optimization

- All agents use `haiku` model (50% cheaper than sonnet)
- Clear boundaries prevent overlap
- Delegation reduces main assistant token usage
