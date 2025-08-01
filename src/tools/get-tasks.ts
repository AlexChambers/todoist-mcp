import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getMaxPaginatedResults } from '../utils/get-max-paginated-results.js'
import { validateProject } from '../utils/verification.js'

export function registerGetTasks(server: McpServer, api: TodoistApi) {
    server.tool(
        'get-tasks',
        'Get all tasks from Todoist',
        {
            projectId: z.string(),
            projectName: z.string().describe('Project name for verification'),
        },
        async ({ projectId, projectName }) => {
            // Always validate project since parameters are now required
            await validateProject(projectId, projectName, api)

            const tasks = await getMaxPaginatedResults((params) =>
                api.getTasks({ projectId, ...params }),
            )
            return {
                content: tasks.map((task) => ({
                    type: 'text',
                    text: JSON.stringify(task, null, 2),
                })),
            }
        },
    )
}
