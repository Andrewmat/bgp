import {Authenticator} from 'remix-auth'
import {sessionStorage} from './session.server'
import {type SessionUser} from './user.schema'
import {discordStrategy} from './auth-discord.server'
import {redirect} from '@remix-run/node'
import {mockStrategy} from './auth-mock.server'

function createAuthenticator() {
	// do not expose authenticator directly. It should always
	// be protected by a layer of abstraction
	const authenticator = new Authenticator<SessionUser>(
		sessionStorage,
	)

	authenticator.use(discordStrategy)
	if (process.env.NODE_ENV === 'development') {
		authenticator.use(mockStrategy, 'mock')
	}

	/** Call this to check if the user is authenticated.
	 * It will return a Promise with the user object or null,
	 * you can use this to check if the user is logged-in or not.
	 * */
	function getSessionUser(request: Request) {
		return authenticator.isAuthenticated(request)
	}
	async function authenticateDiscord(request: Request) {
		return authenticator.authenticate('discord', request)
	}
	async function authenticateMock(request: Request) {
		return authenticator.authenticate('mock', request, {
			successRedirect: '/me',
			throwOnError: true,
			failureRedirect: '/login?error',
		})
	}

	/** @returns Response to redirect to destination, in case of success or failure */
	async function callbackDiscord(
		request: Request,
		redirectTo = '/home',
	) {
		const paramInput = new URL(request.url).searchParams
		const paramOutput = new URLSearchParams()
		paramOutput.set(
			'error',
			paramInput.get('errorMessage') ?? 'true',
		)
		return authenticator.authenticate('discord', request, {
			successRedirect: redirectTo,
			failureRedirect: `/login?${paramOutput}`,
		})
	}

	async function logout(request: Request) {
		await authenticator.logout(request, {redirectTo: '/'})
	}

	return {
		getSessionUser: getSessionUser,
		authenticateDiscord,
		authenticateMock,
		callbackDiscord,
		logout,
	}
}

export const {
	getSessionUser,
	authenticateDiscord,
	authenticateMock,
	callbackDiscord,
	logout,
} = createAuthenticator()

export async function assertAuthenticated(
	request: Request,
) {
	const user = await getSessionUser(request)
	if (!user) {
		const params = new URLSearchParams()
		params.set('redirectTo', new URL(request.url).pathname)
		throw redirect(`/login?${params}`)
	}
	return user
}
export async function assertNotAuthenticated(
	request: Request,
) {
	const user = await getSessionUser(request)
	if (user) {
		throw redirect('/home')
	}
}
