import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateLabel } from '../utils/verification.js'

export function registerUpdateLabel(server: McpServer, api: TodoistApi) {
    server.tool(
        'update-label',
        'Update a label in Todoist',
        {
            labelId: z.string(),
            labelName: z.string().describe('Label name for verification'),
            name: z.string(),
            color: z
                .enum([
                    'berry_red',
                    'light_blue',
                    'red',
                    'blue',
                    'orange',
                    'grape',
                    'yellow',
                    'violet',
                    'olive_green',
                    'lavender',
                    'lime_green',
                    'magenta',
                    'green',
                    'salmon',
                    'mint_green',
                    'charcoal',
                    'teal',
                    'grey',
                    'sky_blue',
                ])
                .optional(),
            isFavorite: z.boolean().optional(),
            order: z.number().optional(),
        },
        async ({ labelId, labelName, name, color, isFavorite, order }) => {
            // Validate label before updating
            await validateLabel(labelId, labelName, api)

            const success = await api.updateLabel(labelId, { name, color, isFavorite, order })
            return {
                content: [
                    {
                        type: 'text',
                        text: success
                            ? `Label ${labelId} updated to ${name}`
                            : `Failed to update label ${labelId} to ${name}`,
                    },
                ],
            }
        },
    )
}
