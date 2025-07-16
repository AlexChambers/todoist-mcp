import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateTask } from '../utils/verification.js'

export function registerGetTask(server: McpServer, api: TodoistApi) {
    server.tool(
        'get-task',
        'Retrieves a task by its ID in Todoist',
        {
            taskId: z.string(),
            taskName: z.string().describe('Task content/name for verification'),
            projectName: z.string().describe('Project name for verification'),
        },
        async ({ taskId, taskName, projectName }) => {
            // Validate task and project match expectations
            await validateTask(taskId, taskName, projectName, api)

            const task = await api.getTask(taskId)
            return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] }
        },
    )
}
