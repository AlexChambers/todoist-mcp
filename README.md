# Todoist MCP (Security-Enhanced Fork)

Connect this [Model Context Protocol](https://modelcontextprotocol.io/introduction) server to your LLM to interact with Todoist.

> **Note:** This is an official fork of the [original Doist repository](https://github.com/Doist/todoist-mcp) with enhanced security features for AI hallucination protection. These security enhancements are maintained on the master branch.

## 🛡️ Security Features

This MCP server implements **AI Hallucination Protection** through redundant verification parameters. All destructive operations require human-readable verification to prevent accidental modifications due to AI mixing up opaque IDs.

**Key Benefits:**
- ✅ **100% Confidence**: Every destructive operation requires task/project names for verification
- ✅ **Fail-Safe Design**: Operations fail if verification doesn't match actual content
- ✅ **Transparent Operations**: See exactly what will be modified before it happens
- ✅ **No Bypass Mechanisms**: Impossible to skip verification requirements

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

## 🔄 Breaking Changes in v2.0

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