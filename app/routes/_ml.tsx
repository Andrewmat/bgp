import {LoaderFunctionArgs} from '@remix-run/node'
import {
	Form,
	Link,
	Outlet,
	json,
	useLoaderData,
} from '@remix-run/react'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/ui/avatar'
import {Button} from '~/components/ui/button'
import {getUser} from '~/lib/login/auth.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await getUser(request)
	return json({user})
}

export default function MainLayout() {
	const {user} = useLoaderData<typeof loader>()
	return (
		<>
			<header className='flex w-full p-4'>
				<div className='flex-grow flex gap-2 items-center'>
					<Link to='/home'>
						<img
							src='/logo.png'
							alt='BGP logo'
							width={100}
							height={100}
						/>
					</Link>
					<h1 className='text-lg'>Board Game Planilha</h1>
				</div>
				{user ? (
					<div>
						<Link to='/me'>
							<Avatar>
								<AvatarImage src={user.profileImage} />
								<AvatarFallback>
									{user.name.slice(0, 2)}
								</AvatarFallback>
							</Avatar>
							<h2>{user.name}</h2>
						</Link>
						<Form method='POST' action='/logout'>
							<Button variant='link'>Logout</Button>
						</Form>
					</div>
				) : (
					<Button asChild>
						<Link to='/login'>Login</Link>
					</Button>
				)}
			</header>
			<main className='container my-4'>
				<Outlet />
			</main>
			<footer></footer>
		</>
	)
}
