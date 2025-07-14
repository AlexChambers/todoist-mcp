import type { TodoistApi, UpdateCommentArgs } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateComment } from '../utils/verification.js'

export function registerUpdateComment(server: McpServer, api: TodoistApi) {
    server.tool(
        'update-comment',
        'Update a comment in Todoist',
        {
            commentId: z.string().describe('The ID of the comment to update'),
            currentCommentContent: z
                .string()
                .describe('First 50 characters of current comment content for verification'),
            taskName: z.string().optional().describe('Task name if comment is on a task'),
            projectName: z.string().describe('Project name for verification'),
            newContent: z.string().describe('The new content for the comment'),
        },
        async ({ commentId, currentCommentContent, taskName, projectName, newContent }) => {
            // Validate comment and context match expectations
            const { comment, task, project } = await validateComment(
                commentId,
                currentCommentContent,
                api,
                taskName,
                projectName,
            )

            const updateArgs: UpdateCommentArgs = { content: newContent }
            const updatedComment = await api.updateComment(commentId, updateArgs)

            const contextDescription = task
                ? `on task "${task.content}" in project "${project.name}"`
                : `on project "${project.name}"`

            return {
                content: [
                    {
                        type: 'text',
                        text: `Comment updated ${contextDescription}: "${comment.content.substring(0, 50)}..." → "${newContent.substring(0, 50)}..."`,
                    },
                ],
            }
        },
    )
}
