import {DiscordProfile} from 'remix-auth-discord'

export type SessionUser = DiscordUser

type DiscordUser = {
	provider: 'discord'
	accessToken: string
	refreshToken: string | undefined
	id: DiscordProfile['id']
	name: DiscordProfile['displayName']
	profileImage: DiscordProfile['__json']['avatar']
	email: DiscordProfile['__json']['email']
}
