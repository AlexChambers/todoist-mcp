import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateProject } from '../utils/verification.js'

export function registerGetTasks(server: McpServer, api: TodoistApi) {
    server.tool(
        'get-tasks',
        'Get all tasks from Todoist',
        {
            projectId: z.string().optional(),
            projectName: z.string().optional().describe('Project name for verification'),
        },
        async ({ projectId, projectName }) => {
            // Validate project if projectId and projectName are provided
            if (projectId && projectName) {
                await validateProject(projectId, projectName, api)
            }

            let response = await api.getTasks({ projectId })
            const tasks = response.results
            while (response.nextCursor) {
                response = await api.getTasks({ projectId, cursor: response.nextCursor })
                tasks.push(...response.results)
            }
            return {
                content: tasks.map((task) => ({
                    type: 'text',
                    text: JSON.stringify(task, null, 2),
                })),
            }
        },
    )
}
