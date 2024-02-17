import {LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {getFollowing} from '~/lib/db/follow.server'
import {assertAuthenticated} from '~/lib/login/auth.server'
import {FormTableManager} from '../components/FormTableManager'
import {getOnSession} from '~/lib/login/session.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await assertAuthenticated(request)
	const following = await getFollowing({
		followedById: user.id,
	})
	const table = await getOnSession(request, 'table')
	return json({following, table, user})
}

export default function FollowingPage() {
	console.log
	const {following, table, user} =
		useLoaderData<typeof loader>()

	return (
		<Card>
			<CardHeader>
				<CardTitle>Seguindo</CardTitle>
			</CardHeader>
			<CardContent className='pt-6'>
				<FormTableManager
					user={user}
					following={following}
					table={table ?? []}
				/>
			</CardContent>
		</Card>
	)
}
