import type { AddTaskArgs, TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { textToPriority, transformTaskPriority } from '../utils/priority.js'
import { validateParentTask, validateProject } from '../utils/verification.js'

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

export function registerAddTask(server: McpServer, api: TodoistApi) {
    server.tool(
        'add-task',
        'Add a task to Todoist',
        {
            content: z.string(),
            description: z.string().optional(),
            projectId: z.string().optional().describe('The ID of a project to add the task to'),
            projectName: z.string().optional().describe('Project name for verification'),
            assigneeId: z
                .string()
                .optional()
                .describe('The ID of a project collaborator to assign the task to'),
            priority: z
                .union([
                    z.number().min(1).max(4),
                    z.enum(['Urgent', 'High', 'Medium', 'Low', 'urgent', 'high', 'medium', 'low']),
                ])
                .optional()
                .describe('Task priority: 1-4 or Urgent/High/Medium/Low'),
            labels: z.array(z.string()).optional(),
            parentId: z.string().optional().describe('The ID of a parent task'),
            parentTaskName: z.string().optional().describe('Parent task name for verification'),
            dueString: z
                .string()
                .optional()
                .describe('Natural language description of due date like "tomorrow at 3pm"'),
            dueLang: z
                .string()
                .optional()
                .describe('2-letter code specifying language of due date'),
            dueDate: z
                .string()
                .optional()
                .describe("Specific date in YYYY-MM-DD format relative to user's timezone"),
            dueDatetime: z
                .string()
                .optional()
                .describe('Full ISO datetime format like "2023-12-31T15:00:00Z"'),
            deadlineDate: z
                .string()
                .optional()
                .describe("Specific date in YYYY-MM-DD format relative to user's timezone."),
            deadlineLang: z
                .string()
                .optional()
                .describe('2-letter code specifying language of deadline.'),
            duration: z
                .number()
                .optional()
                .describe('Duration of the task (must be provided with durationUnit)'),
            durationUnit: z
                .enum(['minute', 'day'])
                .optional()
                .describe('Unit for task duration (must be provided with duration)'),
        },
        async ({
            content,
            description,
            projectId,
            projectName,
            parentId,
            parentTaskName,
            assigneeId,
            priority,
            labels,
            dueString,
            dueLang,
            dueDate,
            dueDatetime,
            deadlineDate,
            deadlineLang,
            duration,
            durationUnit,
        }) => {
            // Validate that dueDate and dueDatetime are not both provided
            if (dueDate && dueDatetime) {
                throw new Error('Cannot provide both dueDate and dueDatetime')
            }

            // Validate that if duration or durationUnit is provided, both must be provided
            if ((duration && !durationUnit) || (!duration && durationUnit)) {
                throw new Error('Must provide both duration and durationUnit, or neither')
            }

            // Validate project if projectId and projectName are provided
            if (projectId && projectName) {
                await validateProject(projectId, projectName, api)
            }

            // Validate parent task if parentId and parentTaskName are provided
            if (parentId && parentTaskName) {
                if (!projectName) {
                    throw new Error('projectName is required when parentTaskName is provided')
                }
                await validateParentTask(parentId, parentTaskName, projectName, api)
            }

            // Convert text priority to number if needed
            const numericPriority =
                typeof priority === 'string' ? textToPriority(priority) : priority

            // Create base task args
            const baseArgs = {
                content,
                description,
                projectId,
                parentId,
                assigneeId,
                priority: numericPriority,
                labels,
                dueString,
                dueLang,
                deadlineDate,
                deadlineLang,
            }

            // Handle due date (can only have one of dueDate or dueDatetime)
            let taskArgs: Partial<AddTaskArgs> = {}
            if (dueDate) {
                taskArgs = { ...baseArgs, dueDate }
            } else if (dueDatetime) {
                taskArgs = { ...baseArgs, dueDatetime }
            } else {
                taskArgs = baseArgs
            }

            // Handle duration (must have both or neither)
            if (duration !== undefined && durationUnit !== undefined) {
                taskArgs = { ...taskArgs, duration, durationUnit }
            }

            const task = await api.addTask(taskArgs as AddTaskArgs)
            const transformedTask = transformTaskPriority(task)
            const filteredTask = filterTaskFields(transformedTask, DEFAULT_TASK_FIELDS)

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(filteredTask, null, 2),
                    },
                ],
            }
        },
    )
}
