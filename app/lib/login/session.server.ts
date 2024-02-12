import {createCookieSessionStorage} from '@remix-run/node'
import invariant from 'tiny-invariant'
import {SessionUser} from './user.schema'

invariant(
	process.env.SESSION_SECRET,
	`SESSION_SECRET should be set in the env`,
)

type SessionTable = string[]

interface SessionValue {
	user: SessionUser
	table: SessionTable
}

export const sessionStorage =
	createCookieSessionStorage<SessionValue>({
		cookie: {
			name: '_session',
			sameSite: 'lax',
			path: '/',
			httpOnly: true,
			secrets: [process.env.SESSION_SECRET],
			secure: process.env.NODE_ENV === 'production',
		},
	})

export async function setOnSession(
	request: Request,
	name: keyof SessionValue,
	value: SessionValue[typeof name],
) {
	const session = await sessionStorage.getSession(
		request.headers.get('cookie'),
	)
	session.set(name, value)
	return function commit() {
		return sessionStorage.commitSession(session)
	}
}

export async function getOnSession<
	TName extends keyof SessionValue,
>(request: Request, name: TName) {
	const session = await sessionStorage.getSession(
		request.headers.get('cookie'),
	)
	return session.get(name)
}
