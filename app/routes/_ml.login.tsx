import {LoaderFunctionArgs, json} from '@remix-run/node'
import {Form, useLoaderData} from '@remix-run/react'
import {Button} from '~/components/ui/button'
import {assertNotAuthenticated} from '~/lib/login/auth.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const redirectTo =
		new URL(request.url).searchParams.get('redirectTo') ??
		undefined
	await assertNotAuthenticated(request)
	return json({redirectTo})
}

export default function Login() {
	const {redirectTo} = useLoaderData<typeof loader>()
	return (
		<Form action='/auth/discord' method='POST'>
			<input
				type='hidden'
				name='redirectTo'
				value={redirectTo}
			/>
			<Button className='bg-purple-700 hover:bg-purple-900'>
				Login with Discord
			</Button>
		</Form>
	)
}
