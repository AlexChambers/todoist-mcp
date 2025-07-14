import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateTask } from '../utils/verification.js'

export function registerReopenTask(server: McpServer, api: TodoistApi) {
    server.tool(
        'reopen-task',
        'Reopens a previously closed (completed) task in Todoist',
        {
            taskId: z.string(),
            taskName: z.string().describe('Task content/name for verification'),
            projectName: z.string().describe('Project name for verification'),
        },
        async ({ taskId, taskName, projectName }) => {
            // Validate task and project match expectations
            const { task, project } = await validateTask(taskId, taskName, projectName, api)

            const success = await api.reopenTask(taskId)
            return {
                content: [
                    {
                        type: 'text',
                        text: success
                            ? `Task "${task.content}" reopened in project "${project.name}"`
                            : `Failed to reopen task "${task.content}" in project "${project.name}"`,
                    },
                ],
            }
        },
    )
}
