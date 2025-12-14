import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateTask } from '../utils/verification.js'

export function registerDeleteTasksBulk(server: McpServer, api: TodoistApi) {
    server.tool(
        'delete-tasks-bulk',
        'Delete multiple tasks from Todoist in a single operation',
        {
            taskVerifications: z
                .array(
                    z.object({
                        taskId: z.string(),
                        taskName: z.string().describe('Task content/name for verification'),
                        currentProjectName: z
                            .string()
                            .describe('Current project name for verification'),
                    }),
                )
                .describe('Array of tasks to delete with verification data'),
        },
        async ({ taskVerifications }) => {
            const results: string[] = []
            const errors: string[] = []

            for (const { taskId, taskName, currentProjectName } of taskVerifications) {
                try {
                    // Validate task and project match expectations
                    const { task, project } = await validateTask(
                        taskId,
                        taskName,
                        currentProjectName,
                        api,
                    )

                    const success = await api.deleteTask(taskId)
                    if (success) {
                        results.push(
                            `✓ Task "${task.content}" deleted from project "${project.name}"`,
                        )
                    } else {
                        errors.push(
                            `✗ Failed to delete task "${task.content}" from project "${project.name}"`,
                        )
                    }
                } catch (error) {
                    errors.push(
                        `✗ Error deleting task ${taskId}: ${error instanceof Error ? error.message : String(error)}`,
                    )
                }
            }

            const totalRequested = taskVerifications.length
            const successCount = results.length
            const _errorCount = errors.length

            const summary = [
                `Bulk delete completed: ${successCount}/${totalRequested} tasks deleted successfully`,
                '',
                ...results,
            ]

            if (errors.length > 0) {
                summary.push('', 'Errors:', ...errors)
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: summary.join('\n'),
                    },
                ],
            }
        },
    )
}
