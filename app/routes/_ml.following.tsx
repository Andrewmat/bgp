import {LoaderFunctionArgs, json} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import {getFollowing} from '~/lib/db/follow.server'
import {assertAuthenticated} from '~/lib/login/auth.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const sessionUser = await assertAuthenticated(request)
	const following = await getFollowing({
		followedById: sessionUser.id,
	})
	return json({following})
}

export default function FollowingPage() {
	const {following} = useLoaderData<typeof loader>()
	return (
		<ul>
			{following.map((follow) => (
				<li key={follow.id}>
					<Link to={`/user/${follow.username}`}>
						{follow.name}
					</Link>
				</li>
			))}
		</ul>
	)
}
