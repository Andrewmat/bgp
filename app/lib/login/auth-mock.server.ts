import {FormStrategy} from 'remix-auth-form'
import {upsertMockUser} from '../db/user.server'
import {MockUser} from './user.schema'

export const mockStrategy = new FormStrategy(
	async ({form}): Promise<MockUser> => {
		const email = form.get('email')
		if (typeof email !== 'string') {
			throw new Response(`Email parameter is required`, {
				status: 422,
			})
		}
		const user = await upsertMockUser({email})
		return {
			provider: 'mock',
			email: user.email,
			id: user.id,
			name: user.name,
			username: user.username,
		}
	},
)
