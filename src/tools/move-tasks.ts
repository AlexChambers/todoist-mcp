import type { MoveTaskArgs, TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateProject, validateSection, validateTask } from '../utils/verification.js'

export function registerMoveTasks(server: McpServer, api: TodoistApi) {
    server.tool(
        'move-tasks',
        'Move multiple tasks to a project, section, or parent task',
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
                .describe('Array of tasks to move with verification data'),
            // Destination verification (exactly one required)
            destinationProjectId: z.string().optional().describe('Project ID to move tasks to'),
            destinationProjectName: z.string().optional().describe('Project name for verification'),
            destinationSectionId: z.string().optional().describe('Section ID to move tasks to'),
            destinationSectionName: z.string().optional().describe('Section name for verification'),
            destinationParentTaskId: z
                .string()
                .optional()
                .describe('Parent task ID to move tasks under'),
            destinationParentTaskName: z
                .string()
                .optional()
                .describe('Parent task name for verification'),
            destinationParentProjectName: z
                .string()
                .optional()
                .describe('Parent task project name for verification'),
        },
        async ({
            taskVerifications,
            destinationProjectId,
            destinationProjectName,
            destinationSectionId,
            destinationSectionName,
            destinationParentTaskId,
            destinationParentTaskName,
            destinationParentProjectName,
        }) => {
            // Validate exactly one destination is specified
            const destinations = [
                destinationProjectId,
                destinationSectionId,
                destinationParentTaskId,
            ]
            const destinationCount = destinations.filter(Boolean).length
            if (destinationCount !== 1) {
                throw new Error(
                    'You must specify exactly one destination: project, section, or parent task',
                )
            }

            // Validate all tasks exist and match expected names (in parallel)
            const validatedTasks = await Promise.all(
                taskVerifications.map((taskVerification) =>
                    validateTask(
                        taskVerification.taskId,
                        taskVerification.taskName,
                        taskVerification.currentProjectName,
                        api,
                    ),
                ),
            )

            // Validate destination and create move arguments
            let moveArgs: MoveTaskArgs
            let destinationDescription: string

            if (destinationProjectId && destinationProjectName) {
                const { project } = await validateProject(
                    destinationProjectId,
                    destinationProjectName,
                    api,
                )
                moveArgs = { projectId: destinationProjectId }
                destinationDescription = `project "${project.name}"`
            } else if (destinationSectionId && destinationSectionName && destinationProjectName) {
                const { section, project } = await validateSection(
                    destinationSectionId,
                    destinationSectionName,
                    destinationProjectName,
                    api,
                )
                moveArgs = { sectionId: destinationSectionId }
                destinationDescription = `section "${section.name}" in project "${project.name}"`
            } else if (
                destinationParentTaskId &&
                destinationParentTaskName &&
                destinationParentProjectName
            ) {
                const { task: parentTask, project } = await validateTask(
                    destinationParentTaskId,
                    destinationParentTaskName,
                    destinationParentProjectName,
                    api,
                )
                moveArgs = { parentId: destinationParentTaskId }
                destinationDescription = `under parent task "${parentTask.content}" in project "${project.name}"`
            } else {
                throw new Error(
                    'Missing verification parameters for the specified destination type',
                )
            }

            // Move the tasks
            const taskIds = taskVerifications.map((tv) => tv.taskId)
            const _movedTasks = await api.moveTasks(taskIds, moveArgs)

            // Create human-readable response
            const taskNames = validatedTasks.map((vt) => `"${vt.task.content}"`).join(', ')
            return {
                content: [
                    {
                        type: 'text',
                        text: `Moved ${taskVerifications.length} task(s) [${taskNames}] to ${destinationDescription}`,
                    },
                ],
            }
        },
    )
}
