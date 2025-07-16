import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateComment } from '../utils/verification.js'

export function registerGetComment(server: McpServer, api: TodoistApi) {
    server.tool(
        'get-comment',
        'Get a comment from a task or project in Todoist',
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
            await validateComment(commentId, commentContent, api, taskName, projectName)

            const comment = await api.getComment(commentId)
            return {
                content: [{ type: 'text', text: JSON.stringify(comment, null, 2) }],
            }
        },
    )
}
