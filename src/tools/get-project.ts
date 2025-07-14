import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateProject } from '../utils/verification.js'

export function registerGetProject(server: McpServer, api: TodoistApi) {
    server.tool(
        'get-project',
        'Get a project from Todoist',
        {
            projectId: z.string(),
            projectName: z.string().describe('Project name for verification'),
        },
        async ({ projectId, projectName }) => {
            // Validate project before getting details
            await validateProject(projectId, projectName, api)

            const project = await api.getProject(projectId)
            return {
                content: [{ type: 'text', text: JSON.stringify(project, null, 2) }],
            }
        },
    )
}
