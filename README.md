# Todoist MCP (Security-Enhanced Fork)

> [!NOTE]
> **Upstream Notice**: Doist has announced a transition to a new repository [Doist/todoist-ai](https://github.com/Doist/todoist-ai). This security-enhanced fork continues to track the original [Doist/todoist-mcp](https://github.com/Doist/todoist-mcp) with added verification features for AI hallucination protection. See [discussion](https://github.com/Doist/todoist-mcp/discussions/103) for details about the upstream transition.

Connect this [Model Context Protocol](https://modelcontextprotocol.io/introduction) server to your LLM to interact with Todoist.

> **Note:** This is a fork of the [original Doist repository](https://github.com/Doist/todoist-mcp) with enhanced security features for AI hallucination protection. This fork adds verification parameters to prevent accidental data modification through AI hallucination while maintaining full API compatibility.

## 🚀 **Why Use This Fork?**

### Comparison with Doist/todoist-ai (New Official Repository)

| Aspect | **This Fork (todoist-mcp)** | **todoist-ai** |
|--------|------------------------------|----------------|
| **Tool Coverage** | ⚡ 11 tools - Core task management | ⚠️ 21 tools - Full features, growing |
| **Token Efficiency** | ✅ Minimal schemas + filtered responses | ❌ Full API payloads |
| **Security** | ✅ Verification parameters prevent AI hallucination | ❌ No verification system |
| **Architecture** | Pure MCP server | Dual: Direct import + MCP |
| **Bulk Operations** | ✅ Move multiple tasks | ❌ Not available |
| **Focus** | Personal GTD workflow | General purpose |

### Key Advantages of This Fork

1. **🛡️ AI Hallucination Protection**: Every destructive operation requires human-readable verification (task/project names), preventing accidental data loss from AI confusing IDs
2. **⚡ Token-Efficient**: Reduced tool count and filtered response payloads minimize context window usage
3. **🎯 Focused Toolset**: Core task management operations only—no rarely-used features cluttering the tool list
4. **📦 Smart Responses**: Task, project, and section responses return only essential fields

## 🔗 **Upstream Relationship**

This fork tracks the upstream repository and contributes improvements back where appropriate. The security enhancements are maintained on the main branch with the goal of potentially proposing them upstream.

## 🛡️ Security Features

This MCP server implements **AI Hallucination Protection** through redundant verification parameters. All destructive operations require human-readable verification to prevent accidental modifications due to AI mixing up opaque IDs.

**Key Benefits:**
- ✅ **100% Confidence**: Every destructive operation requires task/project names for verification
- ✅ **Fail-Safe Design**: Operations fail if verification doesn't match actual content
- ✅ **Transparent Operations**: See exactly what will be modified before it happens
- ✅ **No Bypass Mechanisms**: Impossible to skip verification requirements
- ✅ **Unicode Normalization**: Smart quotes and special characters are normalized for reliable matching

### 🔍 **Before vs After: Enhanced Tool Call Visibility**

This fork adds human-readable verification parameters to destructive tool calls, making it immediately clear what's being modified:

| **Operation** | **Without Verification** | **With Verification** |
|---------------|--------------------------|----------------------|
| Close Task | `close-task(taskId: "8036534251")` | `close-task(taskId: "8036534251", taskName: "Submit report", projectName: "Work")` |
| Update Task | `update-task(taskId: "8036534251")` | `update-task(taskId: "8036534251", taskName: "Review document", projectName: "Work")` |
| Delete Task | `delete-task(taskId: "8036534251")` | `delete-task(taskId: "8036534251", taskName: "Buy groceries", projectName: "Personal")` |
| Move Tasks | `move-tasks(taskVerifications: [...])` | `move-tasks(taskVerifications: [{"taskName": "Call client", "currentProjectName": "Inbox"}])` |

**Result**: You can immediately see what's being modified without having to decode opaque IDs, reducing the risk of accidental operations from AI hallucination.

## Functionality

This fork provides a **streamlined subset** of the [Todoist TypeScript Client](https://doist.github.io/todoist-api-typescript/api/classes/TodoistApi/) focused on core task management with minimal token overhead.

### Available Tools (11 total)

| Tool | Description | Verification |
|------|-------------|--------------|
| `get-projects` | List all projects (returns id, name, parentId only) | - |
| `get-sections` | List sections in a project | - |
| `get-task` | Get a single task by ID | - |
| `get-tasks` | Get all tasks, optionally filtered by project | - |
| `get-tasks-by-filter` | Query tasks using Todoist filter syntax | - |
| `add-task` | Create a new task | - |
| `update-task` | Modify an existing task | 🛡️ taskName, projectName |
| `close-task` | Complete a task | 🛡️ taskName, projectName |
| `delete-task` | Delete a task permanently | 🛡️ taskName, projectName |
| `move-tasks` | Move tasks between projects/sections | 🛡️ taskName, currentProjectName |
| `add-comment` | Add a comment to a task or project | - |

### Response Field Filtering

To reduce token usage, responses only include essential fields:

- **Tasks**: id, content, description, due, priority, labels, projectId, sectionId, parentId
- **Projects**: id, name, parentId
- **Sections**: id, projectId, name

### Disabled Tools

The following tools are available in the codebase but disabled by default to reduce context overhead. Uncomment imports in `src/index.ts` to enable:

- Labels: add, get, update, delete, shared label operations
- Projects: add, update, delete
- Sections: add, update, delete
- Comments: get, update, delete
- Productivity: stats, completed tasks tracking
- Tasks: quick-add, reopen, bulk-delete

## Setup

**Build the server app:**

```
npm install
npm run build
```

**Configure Claude:**

You must install Claude Code which supports MCP.

You can get your Todoist API key from [Todoist > Settings > Integrations > Developer](https://app.todoist.com/app/settings/integrations/developer).

Then, add the MCP server using the Claude CLI:

```bash
# Local scope (default) - Available only in current project directory:
claude mcp add todoist-mcp -e TODOIST_API_KEY=your_todoist_api_key -- node $(pwd)/build/index.js

# User scope - Available across all projects on your machine:
claude mcp add todoist-mcp -s user -e TODOIST_API_KEY=your_todoist_api_key -- node $(pwd)/build/index.js

# Project scope - Shared via .mcp.json for team collaboration:
claude mcp add todoist-mcp -s project -e TODOIST_API_KEY=your_todoist_api_key -- node $(pwd)/build/index.js
```

Alternatively, for project-level sharing, create a `.mcp.json` file in your project root:

```json
{
    "mcpServers": {
        "todoist-mcp": {
            "command": "node",
            "args": ["/absolute/path/to/todoist-mcp/build/index.js"],
            "env": {
                "TODOIST_API_KEY": "your_todoist_api_key"
            }
        }
    }
}
```

You can now use Claude Code and ask to update Todoist.

## ⚙️ Configuration

### Environment Variables

- **`TODOIST_API_KEY`** (required): Your Todoist API token from [Settings > Integrations > Developer](https://app.todoist.com/app/settings/integrations/developer)
- **`TODOIST_API_VERSION`** (optional): Todoist REST API version to use (default: `9.215`)

Example with custom API version:
```bash
claude mcp add todoist-mcp -e TODOIST_API_KEY=your_key -e TODOIST_API_VERSION=9.216 -- node $(pwd)/build/index.js
```

## 🛡️ Verification Requirements

To prevent AI hallucination errors, destructive operations require verification parameters that confirm the intended target:

| Operation | Required Parameters |
|-----------|---------------------|
| `update-task` | taskName, projectName |
| `close-task` | taskName, projectName |
| `delete-task` | taskName, projectName |
| `move-tasks` | taskName, currentProjectName (per task) |

**Example**: When Claude calls `close-task`, it must provide both the task ID and a verification of the task name and project name. The server validates these match before executing.

```
Claude: "I'll mark 'Buy groceries' as complete."
→ close-task(taskId: "123", taskName: "Buy groceries", projectName: "Personal")
```

If the verification doesn't match, the operation fails safely with a clear error message.

## 🔄 Breaking Changes in v1.0+

**Important:** This version introduces breaking changes for destructive operations. Previous integrations using these tools will need to provide the additional verification parameters.

**Migration Guide:**
- Update any automation scripts to include verification parameters
- The AI assistant will prompt for missing verification information
- All verification uses exact string matching (case-sensitive)
- Operations will fail safely if verification doesn't match actual content

### Unicode Normalization

The verification system automatically normalizes special characters to handle differences between what's stored in Todoist and what's transmitted through the MCP protocol:

| Character Type | Examples | Normalized To |
|---------------|----------|---------------|
| Smart single quotes | `'` `'` `‚` `‛` | `'` (straight apostrophe) |
| Smart double quotes | `"` `"` `„` `‟` | `"` (straight quote) |
| Ellipsis | `…` | `...` (three periods) |
| En/em dashes | `–` `—` | `-` (hyphen) |

This ensures verification works correctly even when tasks are created on mobile devices or with "smart" keyboard settings.

## Distribution

### Smithery

[![smithery badge](https://smithery.ai/badge/@miottid/todoist-mcp)](https://smithery.ai/server/@miottid/todoist-mcp)

Install Todoist MCP on Claude Desktop using [Smithery](https://smithery.ai/server/@miottid/todoist-mcp):

```bash
npx -y @smithery/cli install @miottid/todoist-mcp --client claude
```

### Glama

<a href="https://glama.ai/mcp/servers/2010u29g1w">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/2010u29g1w/badge" alt="Todoist MCP server" />
</a>
