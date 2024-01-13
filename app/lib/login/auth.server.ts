import {Authenticator} from 'remix-auth'
import {sessionStorage} from './session.server'
import {type SessionUser} from './user.schema'
import {DiscordStrategy} from 'remix-auth-discord'
import invariant from 'tiny-invariant'

invariant(
	process.env.DISCORD_CLIENT_ID,
	'DISCORD_CLIENT_ID should be set',
)
invariant(
	process.env.DISCORD_CLIENT_SECRET,
	'DISCORD_CLIENT_SECRET should be set',
)
invariant(process.env.HOST_URL, 'HOST_URL should be set')

// do not export this, use functions below
const authenticator = new Authenticator<SessionUser>(
	sessionStorage,
)

authenticator.use(
	new DiscordStrategy(
		{
			clientID: process.env.DISCORD_CLIENT_ID,
			clientSecret: process.env.DISCORD_CLIENT_SECRET,
			callbackURL: `${process.env.HOST_URL}/auth/discord/callback`,
			scope: ['identify', 'email'],
		},
		async ({
			accessToken,
			refreshToken,
			profile,
		}): Promise<SessionUser> => {
			return {
				provider: 'discord',
				accessToken,
				refreshToken,
				id: profile.id,
				name: profile.displayName,
				email: profile.__json.email,
				profileImage: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.__json.avatar}`,
			}
		},
	),
)

export function isAuthenticated(request: Request) {
	return authenticator.isAuthenticated(request)
}
export async function authenticateDiscord(
	request: Request,
) {
	return authenticator.authenticate('discord', request)
}

export async function callbackDiscord(request: Request) {
	const params = new URLSearchParams()
	params.set('error', 'true')
	return authenticator.authenticate('discord', request, {
		successRedirect: '/home',
		failureRedirect: `/login?${params}`,
	})
}

export async function logout(request: Request) {
	return authenticator.logout(request, {redirectTo: '/'})
}
