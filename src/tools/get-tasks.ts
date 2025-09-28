import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getMaxPaginatedResults } from '../utils/get-max-paginated-results.js'
import { transformTaskPriority } from '../utils/priority.js'
import { validateProject } from '../utils/verification.js'

function filterTaskFields(task: any, fields?: string[]): any {
    if (!fields || fields.length === 0) {
        return task
    }

    const filtered: any = {}
    for (const field of fields) {
        if (field in task) {
            filtered[field] = task[field]
        }
    }
    return filtered
}

export function registerGetTasks(server: McpServer, api: TodoistApi) {
    server.tool(
        'get-tasks',
        'Get all tasks from Todoist',
        {
            projectId: z.string(),
            projectName: z.string().describe('Project name for verification'),
            page: z.number().min(1).optional().describe('Page number (1-based, optional)'),
            tasksPerPage: z
                .number()
                .min(1)
                .max(200)
                .optional()
                .describe('Number of tasks per page (1-200, optional)'),
            fields: z
                .array(z.string())
                .optional()
                .describe(
                    'Fields to include in response (e.g., ["id", "content", "due", "priority"]). If not specified, all fields are returned.',
                ),
        },
        async ({ projectId, projectName, page, tasksPerPage, fields }) => {
            // Always validate project since parameters are now required
            await validateProject(projectId, projectName, api)

            // Validate pagination parameters
            if (page !== undefined && tasksPerPage === undefined) {
                throw new Error('tasksPerPage is required when page is specified')
            }
            if (page === undefined && tasksPerPage !== undefined) {
                throw new Error('page is required when tasksPerPage is specified')
            }

            let tasks: unknown[]

            if (page !== undefined && tasksPerPage !== undefined) {
                // Paginated request - get only first page from API and slice immediately
                const response = await api.getTasks({ projectId })
                const firstPageTasks = response.results || []

                const startIndex = (page - 1) * tasksPerPage
                const endIndex = startIndex + tasksPerPage
                tasks = firstPageTasks.slice(startIndex, endIndex)
            } else {
                // Default behavior - get all tasks with pagination limit
                tasks = await getMaxPaginatedResults((params) =>
                    api.getTasks({ projectId, ...params }),
                )
            }

            // Apply field filtering if specified
            const filteredTasks = tasks.map((task) => filterTaskFields(task, fields))

            // Transform priorities to text
            const transformedTasks = filteredTasks.map((task) => transformTaskPriority(task))

            return {
                content: transformedTasks.map((task) => ({
                    type: 'text' as const,
                    text: JSON.stringify(task, null, 2),
                })),
            }
        },
    )
}
