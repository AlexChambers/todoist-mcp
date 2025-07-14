import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateComment } from '../utils/verification.js'

export function registerDeleteComment(server: McpServer, api: TodoistApi) {
    server.tool(
        'delete-comment',
        'Delete a comment from a task in Todoist',
        {
            commentId: z.string(),
            commentContent: z
                .string()
                .describe('First 50 characters of comment content for verification'),
            taskName: z.string().optional().describe('Task name if comment is on a task'),
            projectName: z.string().describe('Project name for verification'),
        },
        async ({ commentId, commentContent, taskName, projectName }) => {
            // Validate comment and context match expectations
            const { comment, task, project } = await validateComment(
                commentId,
                commentContent,
                api,
                taskName,
                projectName,
            )

            const success = await api.deleteComment(commentId)

            const contextDescription = task
                ? `on task "${task.content}" in project "${project.name}"`
                : `on project "${project.name}"`

            return {
                content: [
                    {
                        type: 'text',
                        text: success
                            ? `Comment "${comment.content.substring(0, 50)}..." deleted ${contextDescription}`
                            : `Failed to delete comment "${comment.content.substring(0, 50)}..." ${contextDescription}`,
                    },
                ],
            }
        },
    )
}
