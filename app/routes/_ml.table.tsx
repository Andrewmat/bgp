import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import {Form, Link, useLoaderData} from '@remix-run/react'
import {useId} from 'react'
import {Button} from '~/components/ui/button'
import {Checkbox} from '~/components/ui/checkbox'
import {Label} from '~/components/ui/label'
import {getFollowing} from '~/lib/db/follow.server'
import {assertAuthenticated} from '~/lib/login/auth.server'
import {
	getOnSession,
	setOnSession,
} from '~/lib/login/session.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await assertAuthenticated(request)
	const following = await getFollowing({
		followedById: user.id,
	})
	const table = await getOnSession(request, 'table')
	return json({table, following})
}

export async function action({
	request,
}: ActionFunctionArgs) {
	const formData = await request.formData()
	const userIds = formData.getAll('user-id') as string[]

	const commitSession = await setOnSession(
		request,
		'table',
		userIds,
	)
	return json(null, {
		headers: {'Set-Cookie': await commitSession()},
	})
}

export default function TablePage() {
	const {following, table} = useLoaderData<typeof loader>()
	const id = useId()
	return (
		<>
			<Form method='POST'>
				{following.map((follow) => (
					<div key={follow.id}>
						<Checkbox
							name='user-id'
							value={follow.id}
							id={`${id}-follow-${follow.id}`}
						/>
						<Label htmlFor={`${id}-follow-${follow.id}`}>
							{follow.name}{' '}
							<small>
								<Link to={`/user/${follow.username}`}>
									(@{follow.username})
								</Link>
							</small>
						</Label>
					</div>
				))}
				<Button type='submit'>Criar mesa</Button>
			</Form>
			{table && (
				<div>
					On Table:
					{JSON.stringify(table)}
				</div>
			)}
		</>
	)
}
