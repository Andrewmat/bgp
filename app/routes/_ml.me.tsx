import {LoaderFunctionArgs, json} from '@remix-run/node'
import {Outlet, useLoaderData} from '@remix-run/react'
import {assertAuthenticated} from '~/lib/login/auth.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await assertAuthenticated(request)

	return json({user})
}

export default function MePage() {
	const {user} = useLoaderData<typeof loader>()

	return (
		<div>
			<h1>Hello {user.name}</h1>
			<Outlet />
		</div>
	)
}
