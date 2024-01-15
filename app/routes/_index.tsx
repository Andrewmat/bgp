import {
	LinksFunction,
	LoaderFunctionArgs,
	redirect,
} from '@remix-run/node'
import {Link} from '@remix-run/react'
import {SearchForm} from '~/components/SearchForm'
import SLink from '~/components/ui/SLink'
import {getUser} from '~/lib/login/auth.server'

export const links: LinksFunction = () => [
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Balsamiq+Sans:wght@700&display=swap',
	},
]

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await getUser(request)
	if (user) {
		return redirect('/home')
	}
	return null
}

export default function IndexPage() {
	return (
		<>
			<header className='flex items-center p-4 gap-3'>
				<Link to='/'>
					<img
						src='/logo.png'
						alt='BGP logo'
						width='30'
						height='30'
					/>
				</Link>
				<Link
					to='http://boardgamegeek.com/'
					rel='noreferrer'
				>
					<img
						src='/powered-by-bgg.png'
						alt='Powered by BGG'
						width='100'
						height='30'
					/>
				</Link>
				<div className='flex-grow'>
					<SearchForm hideExact />
				</div>
				<nav>
					<SLink to='/home'>Home</SLink>
					<SLink to='/login' variant='default'>
						Entrar
					</SLink>
				</nav>
			</header>
			<main>
				<div className='hero w-full bg-primary text-primary-foreground text-center flex flex-col justify-center py-12'>
					<div className='flex justify-center'>
						<img
							src='/logo.png'
							alt='Logo do BGG'
							className='aspect-square h-[100px]'
						/>
					</div>
					<h1 className="text-4xl font-['Balsamiq_Sans'] mt-8 font-bold">
						Board Game Planilha
					</h1>
					<h2 className='text-2xl mt-8'>
						Sua planilha online de board games
					</h2>
					<div className='flex justify-center gap-10 mt-12'>
						<SLink
							to='/login'
							variant='secondary'
							size='lg'
							className='rounded-full text-lg'
						>
							Entrar
						</SLink>
						<SLink
							to='/home'
							variant='secondary'
							size='lg'
							className='rounded-full text-lg'
						>
							Home
						</SLink>
					</div>
				</div>
			</main>
			<footer></footer>
		</>
	)
}
