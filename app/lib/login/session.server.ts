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
