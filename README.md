# Todoist MCP (Security-Enhanced Fork)

> [!NOTE]
> **Upstream Notice**: Doist has announced a transition to a new repository [Doist/todoist-ai](https://github.com/Doist/todoist-ai). This security-enhanced fork continues to track the original [Doist/todoist-mcp](https://github.com/Doist/todoist-mcp) with added verification features for AI hallucination protection. See [discussion](https://github.com/Doist/todoist-mcp/discussions/103) for details about the upstream transition.

Connect this [Model Context Protocol](https://modelcontextprotocol.io/introduction) server to your LLM to interact with Todoist.

> **Note:** This is a fork of the [original Doist repository](https://github.com/Doist/todoist-mcp) with enhanced security features for AI hallucination protection. This fork adds verification parameters to prevent accidental data modification through AI hallucination while maintaining full API compatibility.

## 🚀 **Why Use This Fork?**

### Comparison with Doist/todoist-ai (New Official Repository)

| Aspect | **This Fork (todoist-mcp)** | **todoist-ai** |
|--------|------------------------------|----------------|
| **Tool Coverage** | ✅ 40 tools - Complete API coverage | ⚠️ 21 tools - Core features, expanding |
| **Security** | ✅ Verification parameters prevent AI hallucination | ❌ No verification system |
| **Architecture** | Pure MCP server | Dual: Direct import + MCP |
| **Bulk Operations** | ✅ Move multiple tasks, bulk delete | ❌ Not available |
| **Label Management** | ✅ Full support including shared labels | ❌ Not available |
| **Productivity Features** | ✅ Stats, completed tasks tracking | ❌ Limited |
| **Maturity** | Stable, production-ready | Early stage |

### Key Advantages of This Fork

1. **🛡️ AI Hallucination Protection**: Every destructive operation requires human-readable verification (task/project names), preventing accidental data loss from AI confusing IDs
2. **📦 Complete Feature Set**: All Todoist API endpoints implemented - labels, sections, comments, collaborators, productivity stats
3. **⚡ Bulk Operations**: Efficiently move or delete multiple tasks at once
4. **📊 Advanced Features**: Productivity statistics, completed tasks by date range, shared labels
5. **🔄 Proven Stability**: Battle-tested with comprehensive error handling

## 🔗 **Upstream Relationship**

This fork tracks the upstream repository and contributes improvements back where appropriate. The security enhancements are maintained on the main branch with the goal of potentially proposing them upstream.

## 🛡️ Security Features

This MCP server implements **AI Hallucination Protection** through redundant verification parameters. All destructive operations require human-readable verification to prevent accidental modifications due to AI mixing up opaque IDs.

**Key Benefits:**
- ✅ **100% Confidence**: Every destructive operation requires task/project names for verification
- ✅ **Fail-Safe Design**: Operations fail if verification doesn't match actual content
- ✅ **Transparent Operations**: See exactly what will be modified before it happens
- ✅ **No Bypass Mechanisms**: Impossible to skip verification requirements

### 🔍 **Before vs After: Enhanced Tool Call Visibility**

This fork adds human-readable verification parameters to tool calls, making it immediately clear what operations are being performed:

| **Operation** | **Original Fork** | **This Fork (Security-Enhanced)** |
|---------------|-------------------|-----------------------------------|
| Get Project | `todoist-mcp - get-project (MCP)(projectId: "2331449668")` | `todoist-mcp - get-project (MCP)(projectId: "2331449668", projectName: "Inbox")` |
| Get Tasks | `todoist-mcp - get-tasks (MCP)(projectId: "2331449668")` | `todoist-mcp - get-tasks (MCP)(projectId: "2331449668", projectName: "Inbox")` |
| Delete Task | `todoist-mcp - delete-task (MCP)(taskId: "8036534251")` | `todoist-mcp - delete-task (MCP)(taskId: "8036534251", taskName: "Buy groceries", projectName: "Personal")` |
| Close Task | `todoist-mcp - close-task (MCP)(taskId: "8036534251")` | `todoist-mcp - close-task (MCP)(taskId: "8036534251", taskName: "Submit report", projectName: "Work")` |
| Update Task | `todoist-mcp - update-task (MCP)(taskId: "8036534251")` | `todoist-mcp - update-task (MCP)(taskId: "8036534251", taskName: "Review document", projectName: "Work")` |
| Move Tasks | `todoist-mcp - move-tasks (MCP)(taskVerifications: [...])` | `todoist-mcp - move-tasks (MCP)(taskVerifications: [{"taskName": "Call client", "currentProjectName": "Inbox"}])` |
| Delete Project | `todoist-mcp - delete-project (MCP)(projectId: "2331449668")` | `todoist-mcp - delete-project (MCP)(projectId: "2331449668", projectName: "Old Project")` |
| Update Comment | `todoist-mcp - update-comment (MCP)(commentId: "1234567890")` | `todoist-mcp - update-comment (MCP)(commentId: "1234567890", currentCommentContent: "This needs revision", projectName: "Work")` |

**Result**: You can immediately see what's being modified without having to decode opaque IDs, dramatically reducing the risk of accidental operations due to AI hallucination.

## Functionality

This integration implements all the APIs available from the [Todoist TypeScript Client](https://doist.github.io/todoist-api-typescript/api/classes/TodoistApi/), providing access to:

### Task Management
- Create tasks (with content, descriptions, due dates, priorities, labels, and more)
- Create tasks with natural language (e.g., "Submit report by Friday 5pm #Work")
- Retrieve tasks (individual, filtered, or all tasks)
- Retrieve completed tasks (by completion date or due date)
- Get productivity statistics
- Update tasks
- Move tasks (individually or in batches) **🛡️ Requires verification**
- Close/reopen tasks **🛡️ Requires verification**
- Delete tasks **🛡️ Requires verification**

### Project Management
- Create, retrieve, update, and delete projects **🛡️ Delete requires verification**

### Section Management
- Create, retrieve, update, and delete sections within projects **🛡️ Update/delete requires verification**

### Comment Management
- Add, retrieve, update, and delete comments for tasks or projects **🛡️ Update/delete requires verification**

### Label Management
- Create, retrieve, update, and delete labels
- Manage shared labels

### Collaboration
- Get collaborators for projects

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

## 🛡️ Verification Requirements for Destructive Operations

To prevent AI hallucination errors, destructive operations require additional verification parameters:

### Task Operations
- **Close Task**: Requires `taskName` and `projectName`
- **Reopen Task**: Requires `taskName` and `projectName`  
- **Delete Task**: Requires `taskName` and `projectName`
- **Move Tasks**: Requires `taskName` and `currentProjectName` for each task

### Project Operations  
- **Delete Project**: Requires `projectName`

### Section Operations
- **Update Section**: Requires `currentSectionName` and `projectName`
- **Delete Section**: Requires `sectionName` and `projectName`

### Comment Operations
- **Update Comment**: Requires `commentContent` (first 50 chars), `taskName` (if on task), and `projectName`
- **Delete Comment**: Requires `commentContent` (first 50 chars), `taskName` (if on task), and `projectName`

**Example Usage:**
```
Claude will automatically prompt for these verification parameters:
"To delete this task, I need you to confirm:
- Task name: 'Buy groceries'  
- Project name: 'Personal'"
```

## 🔄 Breaking Changes in v1.0+

**Important:** This version introduces breaking changes for destructive operations. Previous integrations using these tools will need to provide the additional verification parameters.

**Migration Guide:**
- Update any automation scripts to include verification parameters
- The AI assistant will prompt for missing verification information
- All verification uses exact string matching (case-sensitive)
- Operations will fail safely if verification doesn't match actual content

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
