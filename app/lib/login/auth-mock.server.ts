import {FormStrategy} from 'remix-auth-form'
import {
	getUserByUsername,
	insertMockUser,
} from '../db/user.server'
import {MockUser} from './user.schema'

export const mockStrategy = new FormStrategy(
	async ({form}): Promise<MockUser> => {
		const term = form.get('term')
		let user
		if (typeof term !== 'string' || term.length === 0) {
			user = await insertMockUser()
		} else {
			user = await getUserByUsername(term)
			if (!user?.email.endsWith('@example.com')) {
				throw new Error(
					'Não pode entrar com user dos outros',
				)
			}
		}
		return {
			provider: 'mock',
			email: user.email,
			id: user.id,
			name: user.name,
			username: user.username,
		}
	},
)
