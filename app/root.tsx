import type {
	LinksFunction,
	LoaderFunctionArgs,
	MetaFunction,
} from '@remix-run/node'
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react'
import {
	PreventFlashOnWrongTheme,
	ThemeProvider,
	useTheme,
} from 'remix-themes'
import clsx from 'clsx'
import globals from './globals.css?url'
import {Toaster} from '~/components/ui/sonner'
import {themeSessionResolver} from './lib/login/session.server'

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
	{
		rel: 'dns-prefetch',
		href: 'https://cf.geekdo-images.com/',
	},
]

export const meta: MetaFunction = () => {
	return [
		{title: 'BGP | Board Game Planilha'},
		{
			name: 'description',
			content: 'Otimize sua decisão de jogos de tabuleiro!',
		},
	]
}

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const {getTheme} = await themeSessionResolver(request)
	return {theme: getTheme()}
}

export default function App() {
	const {theme} = useLoaderData<typeof loader>()
	return (
		<ThemeProvider
			specifiedTheme={theme}
			themeAction='/config/theme'
		>
			<RootHtml />
		</ThemeProvider>
	)
}

function RootHtml() {
	const loaderData = useLoaderData<typeof loader>()
	const [theme] = useTheme()
	return (
		<html lang='en' className={clsx(theme)}>
			<head>
				<meta charSet='utf-8' />
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<Meta />
				<Links />
				<PreventFlashOnWrongTheme
					ssrTheme={Boolean(loaderData.theme)}
				/>
			</head>
			<body>
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<Toaster />
			</body>
		</html>
	)
}
