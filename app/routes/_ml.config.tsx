import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import {
	Link,
	MetaFunction,
	useFetcher,
	useLoaderData,
} from '@remix-run/react'
import {useId} from 'react'
import {MegaphoneOffIcon, ShellIcon} from 'lucide-react'
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
import {
	getOnSession,
	setOnSession,
} from '~/lib/login/session.server'
import {AlertClosable} from '~/components/ui/alert-closable'
import {getAllIgnoredGames} from '~/lib/db/gameuser.server'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/ui/tooltip'

export const meta: MetaFunction = () => {
	return [{title: 'Configurações | BGP'}]
}

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const sessionUser = await assertAuthenticated(request)
	const user = await getUser(sessionUser.id)

	if (!user) {
		throw new Response('User not defined', {status: 500})
	}

	return json({
		user,
		ignored: await getAllIgnoredGames({userId: user.id}),
	})
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

	const rawSessionUser = await getOnSession(request, 'user')

	if (rawSessionUser == null) {
		throw new Error(
			'No user in the session after user update',
		)
	}

	const commitSession = await setOnSession(
		request,
		'user',
		{
			...rawSessionUser,
			name: newUser.name,
			username: newUser.username,
		},
	)

	return json(
		{success: true},
		{headers: {'Set-Cookie': await commitSession()}},
	)
}

export default function ConfigPage() {
	const {user, ignored: ignoredList} =
		useLoaderData<typeof loader>()
	const id = useId()
	const userFetcher = useFetcher<typeof action>()
	const ignoredFetcher = useFetcher()

	return (
		<Card>
			<CardHeader>
				<CardTitle>Configurações</CardTitle>
			</CardHeader>
			<CardContent>
				<userFetcher.Form
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
							disabled={userFetcher.state !== 'idle'}
						>
							{userFetcher.state !== 'idle' && (
								<ShellIcon className='mr-2 h-4 w-4 motion-safe:animate-[spin_2s_linear_infinite_reverse]' />
							)}
							Salvar dados
						</Button>
						{userFetcher.data?.success && (
							<AlertClosable className='self-start'>
								Alterações feitas com sucesso!
							</AlertClosable>
						)}
					</div>
				</userFetcher.Form>
			</CardContent>

			<CardHeader>
				<CardTitle>Jogos silenciados</CardTitle>
			</CardHeader>
			<CardContent>
				<TooltipProvider>
					{ignoredList.map((ignoredGame) => (
						<ignoredFetcher.Form
							key={ignoredGame.id}
							method='POST'
							action={`/game/${ignoredGame.id}/relation`}
						>
							<input
								type='hidden'
								name='intent'
								value='ignore'
							/>
							<input
								type='hidden'
								name='value'
								value='false'
							/>
							<div className='flex items-center gap-2'>
								<Tooltip>
									<TooltipTrigger type='submit'>
										<MegaphoneOffIcon className='stroke-muted-foreground hover:stroke-destructive-foreground hover:fill-destructive focus-visible:stroke-destructive-foreground focus-visible:fill-destructive' />
									</TooltipTrigger>
									<TooltipContent>
										Remover silêncio
									</TooltipContent>
								</Tooltip>
								<Button asChild variant='link'>
									<Link to={`/game/${ignoredGame.id}`}>
										{ignoredGame.name}
									</Link>
								</Button>
							</div>
						</ignoredFetcher.Form>
					))}
				</TooltipProvider>
			</CardContent>
		</Card>
	)
}
