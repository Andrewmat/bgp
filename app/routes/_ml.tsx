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
					<SearchBar />
				</div>
				<nav className='flex gap-2 items-center'>
					<SLink to='/home'>Home</SLink>
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
				</nav>
			</header>

			<main className='container my-4 flex-grow'>
				<Outlet />
			</main>

			<footer className='w-full bg-secondary text-secondary-foreground text-center min-h-8'>
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
			</footer>
		</div>
	)
}

function DropdownMenuHeader({
	profileImage,
	name,
}: {
	profileImage: string | undefined
	name: string
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className='inline-flex items-center gap-2'>
				<Avatar>
					<AvatarImage src={profileImage} />
					<AvatarFallback>
						{name.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<span className='font-bold'>{name}</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>
					<Link to='/me'>Profile</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>Settings</DropdownMenuItem>
				<DropdownMenuItem>
					<Form method='POST' action='/logout'>
						<button
							type='submit'
							className='appearance-none'
						>
							Logout
						</button>
					</Form>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
