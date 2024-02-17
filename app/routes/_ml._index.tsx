import {
	LinksFunction,
	LoaderFunctionArgs,
	redirect,
} from '@remix-run/node'
import SLink from '~/components/ui/SLink'
import {getSessionUser} from '~/lib/login/auth.server'

export const links: LinksFunction = () => [
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Balsamiq+Sans:wght@700&display=swap',
	},
]

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await getSessionUser(request)
	if (user) {
		return redirect('/home')
	}
	return null
}

export default function IndexPage() {
	return (
		<div className='full-bleed hero w-full bg-primary text-primary-foreground text-center flex flex-col justify-center py-12'>
			<div className='flex justify-center'>
				<img
					src='/logo.png'
					alt='Logo do BGG'
					height={100}
					width={100}
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
					to='/search'
					variant='secondary'
					size='lg'
					className='rounded-full text-lg'
				>
					Busca
				</SLink>
			</div>
		</div>
	)
}
