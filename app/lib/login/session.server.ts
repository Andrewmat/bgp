import {createCookieSessionStorage} from '@remix-run/node'
import invariant from 'tiny-invariant'

invariant(
	process.env.SESSION_SECRET,
	`SESSION_SECRET should be set in the env`,
)

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: '_session',
		sameSite: 'lax',
		path: '/',
		httpOnly: true,
		secrets: [process.env.SESSION_SECRET],
		secure: process.env.NODE_ENV === 'production',
	},
})

function getSession(request: Request) {
	return sessionStorage.getSession(
		request.headers.get('Cookie'),
	)
}

export async function consumeFromSession(
	request: Request,
	key: string,
) {
	const session = await getSession(request)
	const value = session.get(key)
	console.log('consumeFromSession', key, value)
	// session.unset(key)
	return value
}

export async function setToSession(
	request: Request,
	key: string,
	value: unknown,
) {
	console.log('setToSession', key, value)
	const session = await getSession(request)
	session.set(key, value)
	return {
		'Set-Cookie':
			await sessionStorage.commitSession(session),
	}
}
