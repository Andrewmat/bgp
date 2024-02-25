import {
	LinksFunction,
	LoaderFunctionArgs,
	redirect,
} from '@remix-run/node'
import SLink from '~/components/ui/SLink'
import {getSessionUser} from '~/lib/login/auth.server'
import logoBgp from './homelogo.webp'

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
					src={logoBgp}
					alt='Logo do BGP'
					height={100}
					width={100}
				/>
			</div>
			<h1 className="text-4xl font-['Balsamiq_Sans'] mt-8 font-bold">
				Board Game Planilha
			</h1>
			<h2 className='text-2xl mt-8'>
				Otimize sua decisão de jogos
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
			<div className='py-10'>
				<h2 className='text-xl font-bold mb-4'>
					Como funciona?
				</h2>

				<ol type='a'>
					<li>
						1. <strong>Dê suas notas</strong>
					</li>
					<li>
						2. <strong>Siga seus amigos</strong>
					</li>
					<li>
						3. <strong>Crie uma mesa</strong>
					</li>
				</ol>
			</div>
		</div>
	)
}
