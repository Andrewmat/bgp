export type SessionUser = DiscordUser

interface DiscordUser extends GenericUser {
	provider: 'discord'
}

interface GenericUser {
	provider: 'discord' | 'google'
	id: string
	username: string
	providerId: string
	name: string
	profileImage: string | undefined
	email: string
	accessToken: string
	refreshToken: string | undefined
}
