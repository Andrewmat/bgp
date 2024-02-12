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
import {Input} from '~/components/ui/input'

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
		<div className='w-full max-w-md mx-auto'>
			<Card>
				<CardHeader>
					<CardTitle className='text-center'>
						Login
					</CardTitle>
				</CardHeader>
				<CardContent className='flex flex-col gap-2'>
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
					{process.env.NODE_ENV === 'development' && (
						<Form
							action='/auth/mock'
							method='POST'
							className='flex gap-2'
						>
							<Input
								type='term'
								name='term'
								className='flex-grow'
								placeholder='adorable-cat'
							/>
							<Button type='submit'>Mock User</Button>
						</Form>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
