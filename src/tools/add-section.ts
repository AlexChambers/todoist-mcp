import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateProject } from '../utils/verification.js'

export function registerAddSection(server: McpServer, api: TodoistApi) {
    server.tool(
        'add-section',
        'Add a section to a project in Todoist',
        {
            projectId: z.string(),
            projectName: z.string().describe('Project name for verification'),
            name: z.string(),
            order: z.number().optional(),
        },
        async ({ projectId, projectName, name, order }) => {
            // Validate project before adding section
            await validateProject(projectId, projectName, api)

            const section = await api.addSection({ projectId, name, order })
            return {
                content: [{ type: 'text', text: JSON.stringify(section, null, 2) }],
            }
        },
    )
}
