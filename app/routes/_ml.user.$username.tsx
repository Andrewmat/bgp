import {LoaderFunctionArgs, json} from '@remix-run/node'
import {
	Outlet,
	isRouteErrorResponse,
	useLoaderData,
	useParams,
	useRouteError,
} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {Alert} from '~/components/ui/alert'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
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
			<Card>
				<CardHeader>
					<CardTitle>{user.name}</CardTitle>
					<small>{user.username}</small>
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
