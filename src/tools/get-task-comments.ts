import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getMaxPaginatedResults } from '../utils/get-max-paginated-results.js'
import { validateTask } from '../utils/verification.js'

export function registerGetTaskComments(server: McpServer, api: TodoistApi) {
    server.tool(
        'get-task-comments',
        'Get comments from a task in Todoist',
        {
            taskId: z.string(),
            taskName: z.string().describe('Task content/name for verification'),
            projectName: z.string().describe('Project name for verification'),
        },
        async ({ taskId, taskName, projectName }) => {
            // Validate task and project match expectations
            await validateTask(taskId, taskName, projectName, api)

            const comments = await getMaxPaginatedResults((params) =>
                api.getComments({ taskId, ...params }),
            )
            return {
                content: comments.map((comment) => ({
                    type: 'text',
                    text: JSON.stringify(comment, null, 2),
                })),
            }
        },
    )
}
