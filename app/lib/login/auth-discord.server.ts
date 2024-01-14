import {DiscordStrategy} from 'remix-auth-discord'
import {SessionUser} from './user.schema'
import invariant from 'tiny-invariant'
import {HOST_URL} from '~/lib/env'

invariant(
	process.env.DISCORD_CLIENT_ID,
	'DISCORD_CLIENT_ID should be set',
)
invariant(
	process.env.DISCORD_CLIENT_SECRET,
	'DISCORD_CLIENT_SECRET should be set',
)

export const discordStrategy = new DiscordStrategy(
	{
		clientID: process.env.DISCORD_CLIENT_ID,
		clientSecret: process.env.DISCORD_CLIENT_SECRET,
		callbackURL: `${HOST_URL}/auth/discord/callback`,
		scope: ['identify', 'email'],
	},
	async ({
		accessToken,
		refreshToken,
		profile,
	}): Promise<SessionUser> => {
		if (!profile.__json.email) {
			throw new Error(
				`You should have email set up in your Discord account`,
			)
		}
		return {
			provider: 'discord',
			accessToken,
			refreshToken,
			providerId: profile.id,
			name: profile.displayName,
			email: profile.__json.email,
			profileImage: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.__json.avatar}`,
		}
	},
)
