import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateLabel } from '../utils/verification.js'

export function registerGetLabel(server: McpServer, api: TodoistApi) {
    server.tool(
        'get-label',
        'Get a label from Todoist',
        {
            labelId: z.string(),
            labelName: z.string().describe('Label name for verification'),
        },
        async ({ labelId, labelName }) => {
            // Validate label matches expectations
            await validateLabel(labelId, labelName, api)

            const label = await api.getLabel(labelId)
            return {
                content: [{ type: 'text', text: JSON.stringify(label, null, 2) }],
            }
        },
    )
}
