import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateLabel } from '../utils/verification.js'

export function registerDeleteLabel(server: McpServer, api: TodoistApi) {
    server.tool(
        'delete-label',
        'Delete a label from Todoist',
        {
            labelId: z.string(),
            labelName: z.string().describe('Label name for verification'),
        },
        async ({ labelId, labelName }) => {
            // Validate label before deleting
            await validateLabel(labelId, labelName, api)

            const success = await api.deleteLabel(labelId)
            return {
                content: [
                    {
                        type: 'text',
                        text: success
                            ? `Label ${labelId} deleted`
                            : `Failed to delete label ${labelId}`,
                    },
                ],
            }
        },
    )
}
