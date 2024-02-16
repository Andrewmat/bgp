import {LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {Card, CardContent} from '~/components/ui/card'
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
	const {following, table, user} =
		useLoaderData<typeof loader>()

	return (
		<div className='container'>
			<Card>
				<CardContent className='pt-6'>
					<FormTableManager
						user={user}
						following={following}
						table={table ?? []}
					/>
				</CardContent>
			</Card>
		</div>
	)
}
