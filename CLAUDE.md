# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

### Building the project
```bash
npm install        # Install dependencies
npm run build      # Build TypeScript to JavaScript (runs tsc + permissions)
```

### Code formatting
```bash
npm run format     # Format code using Biome
```

## Architecture Overview

This is a Model Context Protocol (MCP) server that provides a secure interface to the Todoist API. The codebase is organized around a tool-based architecture where each Todoist operation is implemented as a separate tool.

### Key Components

1. **MCP Server Setup** (`src/index.ts`)
   - Initializes the MCP server with stdio transport
   - Registers all available tools with the server
   - Requires `TODOIST_API_KEY` environment variable

2. **Tool Registration Pattern**
   - Each tool is in its own file under `src/tools/`
   - Tools are registered using `server.tool()` with name, description, and schema
   - All tools follow a consistent pattern using Zod for parameter validation

3. **Security Enhancement: Verification System** (`src/utils/verification.ts`)
   - This fork adds verification parameters to prevent AI hallucination errors
   - All destructive operations require human-readable verification (task/project names)
   - Verification functions validate that IDs match expected names before operations
   - Operations fail safely if verification doesn't match actual content

4. **Tool Categories**
   - **Tasks**: add, get, update, close, reopen, delete, move, quick-add
   - **Projects**: add, get, update, delete
   - **Sections**: add, get, update, delete
   - **Comments**: add, get, update, delete
   - **Labels**: add, get, update, delete, shared label operations
   - **Productivity**: stats, completed tasks by date

### Development Guidelines

1. **Adding New Tools**
   - Create a new file in `src/tools/` following the existing pattern
   - Export a `register[ToolName]` function that takes `server` and `api`
   - Use Zod schemas for parameter validation
   - For destructive operations, add verification parameters and use verification utils
   - Import and register the tool in `src/index.ts`

2. **Code Style**
   - Biome is configured for formatting (4 spaces, single quotes, trailing commas)
   - Line width limit: 100 characters
   - TypeScript strict mode is enabled
   - ES modules (type: "module" in package.json)

3. **TypeScript Configuration**
   - Target: ES2022
   - Module: Node16
   - Strict mode enabled
   - Source in `src/`, builds to `build/`

## Testing & Validation

Currently, there are no automated tests in the project. When developing:
- Test tools manually using the MCP server
- Verify that verification parameters work correctly for destructive operations
- Ensure error messages are clear when verification fails

## Environment Requirements

- Node.js 22.17.1 (see `.node-version`)
- `TODOIST_API_KEY` environment variable must be set
- Optional: `TODOIST_API_VERSION` to override API version

## Security Considerations

This fork implements verification parameters to prevent accidental data loss:
- Never skip verification checks for destructive operations
- Verification uses exact string matching (case-sensitive)
- All verification happens before the actual API call
- Failed verifications throw clear error messages