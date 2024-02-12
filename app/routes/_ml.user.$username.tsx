import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import {
	Link,
	Outlet,
	isRouteErrorResponse,
	useFetcher,
	useLoaderData,
	useParams,
	useRouteError,
} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {Alert} from '~/components/ui/alert'
import {Button} from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
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

	const relationFetcher = useFetcher()
	const finalIsFollowing = (() => {
		const optimisticIntent =
			relationFetcher.formData?.get('intent')
		if (optimisticIntent === 'follow') {
			return true
		} else if (optimisticIntent === 'unfollow') {
			return false
		}
		return isFollowing
	})()

	return (
		<div className='px-3 md:px-6 lg:px-8'>
			<Card>
				<CardHeader className='flex justify-between'>
					<div>
						<CardTitle>{userFromPage.name}</CardTitle>
						<small>{userFromPage.username}</small>
					</div>
					{sessionUser && (
						<>
							{sessionUser.id !== userFromPage.id ? (
								<relationFetcher.Form method='POST'>
									<input
										type='hidden'
										name='intent'
										value={
											finalIsFollowing
												? 'unfollow'
												: 'follow'
										}
									/>
									<Button
										disabled={
											finalIsFollowing !== isFollowing
										}
									>
										{finalIsFollowing
											? 'Deixar de seguir'
											: 'Seguir'}
									</Button>
								</relationFetcher.Form>
							) : (
								<>
									<Link to='/following'>Seguindo</Link>
									<Link to='/followers'>Seguidores</Link>
								</>
							)}
						</>
					)}
				</CardHeader>
				<CardContent>
					<Outlet />
				</CardContent>
			</Card>
		</div>
	)
}

export function ErrorBoundary() {
	const {username} = useParams()
	const error = useRouteError()
	if (!isRouteErrorResponse(error)) {
		throw error
	}

	return (
		<div>
			<Alert variant='destructive'>
				User {username} not found!
			</Alert>
		</div>
	)
}
