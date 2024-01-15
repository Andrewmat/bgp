import {LoaderFunctionArgs, json} from '@remix-run/node'
import {Form, useLoaderData} from '@remix-run/react'
import {Button} from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {assertNotAuthenticated} from '~/lib/login/auth.server'
import discordLogo from '~/assets/discord-logo-white.svg'

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
		<div className='container max-w-[450px]'>
			<Card>
				<CardHeader>
					<CardTitle className='text-center'>
						Login
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Form action='/auth/discord' method='POST'>
						<input
							type='hidden'
							name='redirectTo'
							value={redirectTo}
						/>
						<Button className='w-full bg-purple-700 hover:bg-purple-900'>
							<img
								src={discordLogo}
								width='120'
								height='22'
								alt='Discord'
							/>
						</Button>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
