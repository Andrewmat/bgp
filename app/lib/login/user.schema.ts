export type SessionUser = MockUser | DiscordUser

export interface DiscordUser extends GenericUser {
	provider: 'discord'
}

export interface MockUser extends GenericUser {
	provider: 'mock'
	providerId?: undefined
	profileImage?: undefined
	accessToken?: undefined
	refreshToken?: undefined
}

interface GenericUser {
	provider: 'discord' | 'google' | 'mock'
	id: string
	username: string
	name: string
	email: string
	providerId?: string
	profileImage?: string
	accessToken?: string
	refreshToken?: string
}
