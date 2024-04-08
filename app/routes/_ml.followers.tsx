import {LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {TableManager} from '~/components/FormTableManager'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {getFollowers} from '~/lib/db/follow.server'
import {assertAuthenticated} from '~/lib/login/auth.server'
import {getOnSession} from '~/lib/login/session.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await assertAuthenticated(request)
	const table = await getOnSession(request, 'table')
	const followers = await getFollowers({
		followingId: user.id,
	})
	return json({followers, table, user})
}

export default function FollowersPage() {
	const {followers, table, user} =
		useLoaderData<typeof loader>()

	return (
		<Card>
			<CardHeader>
				<CardTitle>Seguidores</CardTitle>
			</CardHeader>
			<CardContent className='pt-6 flex flex-col gap-6'>
				<TableManager
					user={user}
					group={followers}
					table={table ?? []}
				/>
			</CardContent>
		</Card>
	)
}
