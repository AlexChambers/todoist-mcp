import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

const description =
    'Get all tasks from Todoist using a filter.\n\n' +
    'Filters are custom views for your tasks based on specific criteria. You can narrow down your lists according to task name, date, project, label, priority, date created, and more.\n\n' +
    'Common filter examples:\n' +
    '• Basic: "today", "overdue", "p1" (priority 1), "#Work" (project), "@email" (label)\n' +
    '• Search: "search: Meeting", "search: email"\n' +
    '• Dates: "date: Jan 3", "due before: May 5", "created: today"\n' +
    '• Advanced: "today & @email", "#Work & !assigned to: others", "p1 & 7 days"\n\n' +
    'For comprehensive filter documentation, see:\n' +
    'https://todoist.com/help/articles/introduction-to-filters'

export function registerGetTasksByFilter(server: McpServer, api: TodoistApi) {
    server.tool('get-tasks-by-filter', description, { filter: z.string() }, async ({ filter }) => {
        let response = await api.getTasksByFilter({ query: filter })
        const tasks = response.results
        while (response.nextCursor) {
            response = await api.getTasksByFilter({
                query: filter,
                cursor: response.nextCursor,
            })
            tasks.push(...response.results)
        }
        return {
            content: tasks.map((task) => ({
                type: 'text',
                text: JSON.stringify(task, null, 2),
            })),
        }
    })
}
