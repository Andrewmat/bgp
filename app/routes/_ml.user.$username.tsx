import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import {
	Link,
	Outlet,
	isRouteErrorResponse,
	useLoaderData,
	useParams,
	useRouteError,
} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {FollowButton} from '~/components/FollowButton'
import {Alert} from '~/components/ui/alert'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {TooltipProvider} from '~/components/ui/tooltip'
import {
	followUser,
	getIsFollowing,
	unfollowUser,
} from '~/lib/db/follow.server'
import {getUserByUsername} from '~/lib/db/user.server'
import {
	assertAuthenticated,
	getSessionUser,
} from '~/lib/login/auth.server'
import notFoundImage from '~/assets/undraw_empty.svg'
import NavButton from '~/components/NavButton'
import {Separator} from '~/components/ui/separator'

export async function loader({
	params,
	request,
}: LoaderFunctionArgs) {
	invariant(params.username, 'Username is required')
	const sessionUser = await getSessionUser(request)
	const userFromPage = await getUserByUsername(
		params.username,
	)
	if (!userFromPage) {
		throw new Response('Not found', {status: 404})
	}

	let isFollowing: boolean | null
	if (sessionUser) {
		isFollowing = await getIsFollowing({
			followedById: sessionUser.id,
			followingId: userFromPage.id,
		})
	} else {
		isFollowing = null
	}

	return json({userFromPage, sessionUser, isFollowing})
}

export async function action({
	request,
	params,
}: ActionFunctionArgs) {
	const formData = await request.formData()
	const intent = formData.get('intent')

	invariant(params.username, 'Username is required')
	const userFromPage = await getUserByUsername(
		params.username,
	)
	if (!userFromPage) {
		throw new Response('Not found', {status: 404})
	}
	const sessionUser = await assertAuthenticated(request)

	if (intent === 'follow') {
		await followUser({
			followedById: sessionUser.id,
			followingId: userFromPage.id,
		})
		return null
	} else if (intent === 'unfollow') {
		await unfollowUser({
			followedById: sessionUser.id,
			followingId: userFromPage.id,
		})
		return null
	} else {
		throw new Response(`Intent '${intent}' is not expected`)
	}
}

export default function UserPage() {
	const {userFromPage, sessionUser, isFollowing} =
		useLoaderData<typeof loader>()

	return (
		<Card>
			<CardHeader className='flex justify-between'>
				<Link to={`/user/${userFromPage.username}`}>
					<div>
						<CardTitle>{userFromPage.name}</CardTitle>
						<small>{userFromPage.username}</small>
					</div>
				</Link>
				{sessionUser &&
					sessionUser.id !== userFromPage.id && (
						<TooltipProvider>
							<FollowButton
								username={userFromPage.username}
								following={isFollowing ?? false}
							/>
						</TooltipProvider>
					)}
			</CardHeader>
			<CardContent>
				<div className='flex flex-col gap-6'>
					<nav className='flex gap-3'>
						<NavButton
							to={`/user/${userFromPage.username}/games`}
						>
							Jogos votados
						</NavButton>
						<NavButton
							to={`/user/${userFromPage.username}/follows`}
						>
							Follows
						</NavButton>
					</nav>
					<Separator />
					<Outlet />
				</div>
			</CardContent>
		</Card>
	)
}

export function ErrorBoundary() {
	const {username} = useParams()
	const error = useRouteError()
	if (!isRouteErrorResponse(error)) {
		throw error
	}

	return (
		<div className='flex items-center justify-center'>
			<Alert
				variant='destructive'
				className='flex flex-col gap-6 md:aspect-square max-w-md items-center justify-center'
			>
				<img
					src={notFoundImage}
					className='h-[150px]'
					alt=''
					height='150'
				/>
				<p className='max-w-prose font-bold text-large text-center text-pretty'>
					Usuário {username} não foi encontrado
				</p>
			</Alert>
		</div>
	)
}
