import {LoaderFunctionArgs} from '@remix-run/node'
import {
	Form,
	Link,
	NavLink,
	NavLinkProps,
	Outlet,
	json,
	useLoaderData,
} from '@remix-run/react'
import {HeartIcon} from 'lucide-react'
import {SearchBar} from '~/components/SearchBar'
import SLink from '~/components/ui/SLink'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/ui/avatar'
import {
	Button,
	ButtonProps,
	buttonVariants,
} from '~/components/ui/button'
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
				<div className='flex-grow flex gap-2'>
					<div className='w-full max-w-md'>
						<SearchBar />
					</div>
					<nav className='flex gap-2'>
						<NavButton to='/home'>Home</NavButton>
						<NavButton to='/following'>Seguindo</NavButton>
						<NavButton to='/table'>Mesa</NavButton>
					</nav>
				</div>
				{user ? (
					<DropdownMenuHeader
						name={user.name}
						profileImage={
							'profileImage' in user
								? user.profileImage
								: null
						}
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
				<small>v0.1.0</small>
				<div>
					Made with{' '}
					<HeartIcon
						size='1em'
						fill='red'
						className='inline-block'
					/>{' '}
					by{' '}
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

function NavButton({
	to,
	children,
}: {
	to: NavLinkProps['to']
	children: ButtonProps['children']
}) {
	return (
		<NavLink
			to={to}
			className={({isActive, isPending}) =>
				buttonVariants({
					variant:
						isActive || isPending ? 'secondary' : 'link',
					className: isPending ? 'opacity-60' : undefined,
				})
			}
		>
			{children}
		</NavLink>
	)
}

function DropdownMenuHeader({
	profileImage,
	name,
}: {
	profileImage?: string | null
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
				<DropdownMenuItem asChild>
					<Link to='/me'>Meu perfil</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link to='/config'>Configurações</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Form
						method='POST'
						action='/logout'
						className='w-full'
					>
						<button
							type='submit'
							className='appearance-none text-start w-full'
						>
							Sair
						</button>
					</Form>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
