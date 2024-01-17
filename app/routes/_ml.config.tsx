import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import {
	Form,
	useActionData,
	useFetcher,
	useLoaderData,
} from '@remix-run/react'
import {useId} from 'react'
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
	// const actionData = useActionData<typeof action>()
	const id = useId()

	return (
		<Card>
			<CardHeader>
				<CardTitle>Configurações</CardTitle>
			</CardHeader>
			<CardContent>
				<Form
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
					<Button
						variant='secondary'
						type='submit'
						className='self-end mt-2'
					>
						Salvar dados
					</Button>
				</Form>
			</CardContent>
		</Card>
	)
}
