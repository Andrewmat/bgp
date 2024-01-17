import {LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {getUserByUsername} from '~/lib/db/user.server'

export async function loader({params}: LoaderFunctionArgs) {
	invariant(params.username, 'Username is required')
	const user = await getUserByUsername(params.username)
	if (!user) {
		throw new Response('Not found', {status: 404})
	}
	return json({user})
}

export default function UserPage() {
	const {user} = useLoaderData<typeof loader>()

	return (
		<div>
			<h1>Hello {user.name}</h1>
			{user.Score.map((score) => (
				<div key={score.id}>
					Game id: {score.gameId}
					<br />
					Score: {score.value}
				</div>
			))}
		</div>
	)
}
