import {cssBundleHref} from '@remix-run/css-bundle'
import type {
	LinksFunction,
	MetaFunction,
} from '@remix-run/node'
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react'
import globals from './globals.css'
import {Toaster} from '~/components/ui/sonner'

export const links: LinksFunction = () => [
	{rel: 'stylesheet', href: globals},
	{
		rel: 'preconnect',
		href: 'https://fonts.googleapis.com',
	},
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,300;0,6..12,500;0,6..12,700;1,6..12,300;1,6..12,500;1,6..12,700&display=swap',
	},
	...(cssBundleHref
		? [{rel: 'stylesheet', href: cssBundleHref}]
		: []),
]

export const meta: MetaFunction = () => {
	return [
		{title: 'BGP | Board Game Planilha'},
		{
			name: 'description',
			content: 'Pesquise e revise board games!',
		},
	]
}

export default function App() {
	return (
		<html lang='en'>
			<head>
				<meta charSet='utf-8' />
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<Meta />
				<Links />
			</head>
			<body>
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
				<Toaster />
			</body>
		</html>
	)
}
