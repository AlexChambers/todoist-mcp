import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { transformTaskPriority } from '../utils/priority.js'
import { validateTask } from '../utils/verification.js'

const DEFAULT_TASK_FIELDS = [
    'id',
    'content',
    'description',
    'due',
    'priority',
    'labels',
    'projectId',
    'sectionId',
    'parentId',
]

function filterTaskFields(
    task: Record<string, unknown>,
    fields: string[],
): Record<string, unknown> {
    const filtered: Record<string, unknown> = {}
    for (const field of fields) {
        if (field in task) {
            filtered[field] = task[field]
        }
    }
    return filtered
}

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
            const transformedTask = transformTaskPriority(task)
            const filteredTask = filterTaskFields(transformedTask, DEFAULT_TASK_FIELDS)
            return { content: [{ type: 'text', text: JSON.stringify(filteredTask, null, 2) }] }
        },
    )
}
