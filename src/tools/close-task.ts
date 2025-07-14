import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateTask } from '../utils/verification.js'

export function registerCloseTask(server: McpServer, api: TodoistApi) {
    server.tool(
        'close-task',
        'Close (complete) a task in Todoist',
        {
            taskId: z.string(),
            taskName: z.string().describe('Task content/name for verification'),
            projectName: z.string().describe('Project name for verification'),
        },
        async ({ taskId, taskName, projectName }) => {
            // Validate task and project match expectations
            const { task, project } = await validateTask(taskId, taskName, projectName, api)

            const success = await api.closeTask(taskId)
            return {
                content: [
                    {
                        type: 'text',
                        text: success
                            ? `Task "${task.content}" closed in project "${project.name}"`
                            : `Failed to close task "${task.content}" in project "${project.name}"`,
                    },
                ],
            }
        },
    )
}
