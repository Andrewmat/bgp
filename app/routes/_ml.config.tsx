import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import {useFetcher, useLoaderData} from '@remix-run/react'
import {useId} from 'react'
import {ShellIcon} from 'lucide-react'
import {Button} from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {Input} from '~/components/ui/input'
import {Label} from '~/components/ui/label'
import {getUser, updateUsername} from '~/lib/db/user.server'
import {assertAuthenticated} from '~/lib/login/auth.server'
import {sessionStorage} from '~/lib/login/session.server'
import {SessionUser} from '~/lib/login/user.schema'
import {AlertClosable} from '~/components/ui/alert-closable'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const sessionUser = await assertAuthenticated(request)
	const user = await getUser(sessionUser.id)

	if (!user) {
		throw new Response('User not defined', {status: 500})
	}

	return json({user})
}

export async function action({
	request,
}: ActionFunctionArgs) {
	const sessionUser = await assertAuthenticated(request)

	const formData = await request.formData()
	const name = formData.get('name')
	const username = formData.get('username')

	if (
		typeof name !== 'string' ||
		typeof username !== 'string'
	) {
		throw json(
			{
				message: 'Unprocessable Entity',
				name: typeof name,
				username: typeof username,
			},
			{status: 422},
		)
	}
	if (username.length < 3) {
		throw new Response(
			`Username '${username}' requires at least 3 characters`,
			{status: 422},
		)
	}
	if (!username.match(/^[A-z][A-z0-9-_.]{2,}$/)) {
		throw new Response(
			`Username '${username}' has invalid characters. It should include only alphanumeric characters, or hyphen (-) underscore (_) dot (.)`,
			{status: 422},
		)
	}

	const newUser = await updateUsername({
		id: sessionUser.id,
		name,
		username: username.trim().toLowerCase(),
	})

	const session = await sessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const rawSessionUser = session.get('user') as SessionUser
	session.set('user', {
		...rawSessionUser,
		name: newUser.name,
		username: newUser.username,
	} satisfies SessionUser)

	return json(
		{success: true},
		{
			headers: {
				'Set-Cookie':
					await sessionStorage.commitSession(session),
			},
		},
	)
}

export default function ConfigPage() {
	const {user} = useLoaderData<typeof loader>()
	const id = useId()
	const fetcher = useFetcher<typeof action>()

	return (
		<Card>
			<CardHeader>
				<CardTitle>Configurações</CardTitle>
			</CardHeader>
			<CardContent>
				<fetcher.Form
					method='POST'
					className='flex flex-col w-full gap-2 items-start'
				>
					<Label htmlFor={`name${id}`}>Nome</Label>
					<Input
						id={`name${id}`}
						name='name'
						defaultValue={user.name}
					/>
					<Label htmlFor={`username${id}`}>
						Username (@)
					</Label>
					<Input
						id={`username${id}`}
						name='username'
						defaultValue={user.username}
						maxLength={30}
					/>
					<div className='self-stretch mt-2 flex items-start flex-row-reverse justify-between align-start gap-2'>
						<Button
							variant='secondary'
							type='submit'
							disabled={fetcher.state !== 'idle'}
						>
							{fetcher.state !== 'idle' && (
								<ShellIcon className='mr-2 h-4 w-4 motion-safe:animate-[spin_2s_linear_infinite_reverse]' />
							)}
							Salvar dados
						</Button>
						{fetcher.data?.success && (
							<AlertClosable className='self-start'>
								Alterações feitas com sucesso!
							</AlertClosable>
						)}
					</div>
				</fetcher.Form>
			</CardContent>
		</Card>
	)
}
