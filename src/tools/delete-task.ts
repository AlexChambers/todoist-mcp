import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateTask } from '../utils/verification.js'

export function registerDeleteTask(server: McpServer, api: TodoistApi) {
    server.tool(
        'delete-task',
        'Delete a task from a project in Todoist',
        {
            taskId: z.string(),
            taskName: z.string().describe('Task content/name for verification'),
            projectName: z.string().describe('Project name for verification'),
        },
        async ({ taskId, taskName, projectName }) => {
            // Validate task and project match expectations
            const { task, project } = await validateTask(taskId, taskName, projectName, api)

            const success = await api.deleteTask(taskId)
            return {
                content: [
                    {
                        type: 'text',
                        text: success
                            ? `Task "${task.content}" deleted from project "${project.name}"`
                            : `Failed to delete task "${task.content}" from project "${project.name}"`,
                    },
                ],
            }
        },
    )
}
