import type { AddCommentArgs, TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateProject, validateTask } from '../utils/verification.js'

export function registerAddComment(server: McpServer, api: TodoistApi) {
    server.tool(
        'add-comment',
        'Add a comment to a task or project',
        {
            taskId: z.string().optional().describe('Task ID to add comment to'),
            taskName: z.string().optional().describe('Task name for verification'),
            projectId: z.string().optional().describe('Project ID to add comment to'),
            projectName: z.string().optional().describe('Project name for verification'),
            content: z.string().describe('Comment content'),
            attachment: z
                .object({
                    fileName: z.string().optional(),
                    fileUrl: z.string(),
                    fileType: z.string().optional(),
                    resourceType: z.string().optional(),
                })
                .optional()
                .describe('Attachment for the comment'),
        },
        async ({ taskId, taskName, projectId, projectName, content, attachment }) => {
            // Ensure one and only one of taskId or projectId is provided
            if ((!taskId && !projectId) || (taskId && projectId)) {
                throw new Error('You must provide exactly one of taskId or projectId')
            }

            // Validate task if taskId is provided
            if (taskId) {
                if (!taskName || !projectName) {
                    throw new Error(
                        'When providing a taskId, you must also provide taskName and projectName for verification',
                    )
                }
                await validateTask(taskId, taskName, projectName, api)
            }

            // Validate project if projectId is provided
            if (projectId) {
                if (!projectName) {
                    throw new Error(
                        'When providing a projectId, you must also provide projectName for verification',
                    )
                }
                await validateProject(projectId, projectName, api)
            }

            // Create comment arguments with required projectId or taskId
            let commentArgs: AddCommentArgs

            if (taskId) {
                commentArgs = {
                    content,
                    taskId,
                }
            } else if (projectId) {
                commentArgs = {
                    content,
                    projectId,
                }
            } else {
                // This should never happen due to the earlier validation
                throw new Error('You must provide exactly one of taskId or projectId')
            }

            if (attachment) {
                commentArgs.attachment = attachment
            }

            const comment = await api.addComment(commentArgs)

            return {
                content: [{ type: 'text', text: JSON.stringify(comment, null, 2) }],
            }
        },
    )
}
