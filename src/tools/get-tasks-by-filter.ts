import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getMaxPaginatedResults } from '../utils/get-max-paginated-results.js'
import { transformTasksPriorities } from '../utils/priority.js'

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

const description =
    'Get all tasks from Todoist using a filter.\n\n' +
    'Filters are custom views for your tasks based on specific criteria. You can narrow down your lists according to task name, date, project, label, priority, date created, and more.\n\n' +
    'Common filter examples:\n' +
    '• Basic: "today", "overdue", "p1" (urgent priority), "#Work" (project), "@email" (label)\n' +
    '• Search: "search: Meeting", "search: email"\n' +
    '• Dates: "date: Jan 3", "due before: May 5", "created: today"\n' +
    '• Advanced: "today & @email", "#Work & !assigned to: others", "p1 & 7 days"\n\n' +
    'For comprehensive filter documentation, see:\n' +
    'https://todoist.com/help/articles/introduction-to-filters'

export function registerGetTasksByFilter(server: McpServer, api: TodoistApi) {
    server.tool('get-tasks-by-filter', description, { filter: z.string() }, async ({ filter }) => {
        const tasks = await getMaxPaginatedResults((params) =>
            api.getTasksByFilter({ query: filter, ...params }),
        )
        const transformedTasks = transformTasksPriorities(tasks as { priority?: number }[])
        const filteredTasks = transformedTasks.map((task) =>
            filterTaskFields(task as Record<string, unknown>, DEFAULT_TASK_FIELDS),
        )
        return {
            content: filteredTasks.map((task) => ({
                type: 'text',
                text: JSON.stringify(task, null, 2),
            })),
        }
    })
}
