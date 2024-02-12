import {LoaderFunctionArgs} from '@remix-run/node'
import {
	Form,
	Link,
	Outlet,
	json,
	useLoaderData,
} from '@remix-run/react'
import {SearchBar} from '~/components/SearchBar'
import SLink from '~/components/ui/SLink'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/ui/avatar'
import {buttonVariants} from '~/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {getSessionUser} from '~/lib/login/auth.server'
import {cn} from '~/lib/utils'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await getSessionUser(request)
	return json({user})
}

export default function MainLayout() {
	const {user} = useLoaderData<typeof loader>()
	return (
		<div className='flex flex-col min-h-full'>
			<header className='md:hidden flex flex-col justify-stretch p-3 gap-2'>
				<div className='flex justify-between'>
					<Link to='/'>
						<img
							src='/logo.png'
							alt='BGP logo'
							width='30'
							height='30'
						/>
					</Link>
					{user ? (
						<DropdownMenuHeader
							name={user.name}
							profileImage={null}
						/>
					) : (
						<SLink to='/login' variant='default'>
							Entrar
						</SLink>
					)}
				</div>
				<SearchBar />
			</header>
			<header className='hidden md:flex items-center p-4 gap-3'>
				<Link to='/'>
					<img
						src='/logo.png'
						alt='BGP logo'
						width='30'
						height='30'
					/>
				</Link>
				<div className='flex-grow'>
					<div className='w-full max-w-md'>
						<SearchBar />
					</div>
				</div>
				{user ? (
					<DropdownMenuHeader
						name={user.name}
						profileImage={user.profileImage}
					/>
				) : (
					<SLink to='/login' variant='default'>
						Entrar
					</SLink>
				)}
			</header>

			<main className='main-container my-4 flex-grow flex flex-col'>
				<Outlet />
			</main>

			<footer className='w-full flex justify-center items-center gap-10 p-5 bg-secondary text-secondary-foreground border-t-2 border-t-border'>
				<div>
					Made with ❤️ by{' '}
					<Link
						to='https://boardgamegeek.com/user/andrewmat'
						target='_blank'
						rel='noreferrer'
						className={cn(
							buttonVariants({
								variant: 'link',
							}),
							'inline p-0',
						)}
					>
						@andrewmat
					</Link>
				</div>
				<Link
					to='http://boardgamegeek.com/'
					rel='noreferrer'
				>
					<img
						src='/powered-by-bgg.png'
						alt='Powered by BGG'
						width='150'
						height='45'
						className='dark:drop-shadow-lg'
					/>
				</Link>
			</footer>
		</div>
	)
}

function DropdownMenuHeader({
	profileImage,
	name,
}: {
	profileImage: string | null | undefined
	name: string
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className='inline-flex items-center gap-2'>
				{profileImage !== null && (
					<Avatar>
						<AvatarImage src={profileImage} />
						<AvatarFallback>
							{name.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
				)}
				<span className='font-bold'>{name}</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>
					<Link to='/me'>Meu perfil</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Link to='/following'>Seguindo</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Link to='/config'>Configurações</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Form method='POST' action='/logout'>
						<button
							type='submit'
							className='appearance-none'
						>
							Sair
						</button>
					</Form>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
