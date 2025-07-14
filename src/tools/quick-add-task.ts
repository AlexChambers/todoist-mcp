import type { QuickAddTaskArgs, TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

export function registerQuickAddTask(server: McpServer, api: TodoistApi) {
    server.tool(
        'quick-add-task',
        'Quickly add a task using natural language',
        {
            text: z
                .string()
                .describe(
                    'Task text with natural language parsing (e.g., "Call mom tomorrow at 5pm #personal @phone")',
                ),
            note: z.string().optional().describe('Additional note for the task'),
            reminder: z
                .string()
                .optional()
                .describe('When to be reminded of this task in natural language'),
            autoReminder: z
                .boolean()
                .optional()
                .default(false)
                .describe('Add default reminder for tasks with due times'),
            projectName: z
                .string()
                .optional()
                .describe('Project name for verification (if project is specified in text)'),
        },
        async ({ text, note, reminder, autoReminder, projectName }) => {
            const args: QuickAddTaskArgs = {
                text,
            }

            if (note) args.note = note
            if (reminder) args.reminder = reminder
            if (autoReminder !== undefined) args.autoReminder = autoReminder

            const task = await api.quickAddTask(args)

            // If projectName is provided, verify the task was created in the expected project
            if (projectName) {
                const project = await api.getProject(task.projectId)
                if (project.name !== projectName) {
                    throw new Error(
                        `Task was created in project "${project.name}" but expected "${projectName}"`,
                    )
                }
            }

            return {
                content: [{ type: 'text', text: JSON.stringify(task, null, 2) }],
            }
        },
    )
}
