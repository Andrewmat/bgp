export type SessionUser = DiscordUser

type DiscordUser = {
	provider: 'discord'
	accessToken: string
	refreshToken: string | undefined
	providerId: string
	name: string
	profileImage: string | undefined
	email: string
}
