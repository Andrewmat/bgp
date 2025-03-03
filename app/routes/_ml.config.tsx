import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import {
	Form,
	Link,
	MetaFunction,
	useActionData,
	useFetcher,
	useLoaderData,
	useNavigation,
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
import {z} from 'zod'
import Join from '~/components/Join'

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

const formDataSchema = z.object({
	name: z.string().trim().min(1, 'Nome não pode ser vazio'),
	username: z
		.string()
		.trim()
		.toLowerCase()
		.min(3, 'Username deve conter pelo menos 3 caracteres.')
		.regex(
			/^[A-z]/,
			'Usuário deve começar com um caractere alfabético.',
		)
		.regex(
			/^[A-z0-9-_.]+$/,
			'São válidos caracteres alfanuméricos, pontos (.), hífens (-) ou underlines (_).',
		),
})

export async function action({
	request,
}: ActionFunctionArgs) {
	const sessionUser = await assertAuthenticated(request)

	const formPayload = Object.fromEntries(
		await request.formData(),
	)
	const parseResult = formDataSchema.safeParse(formPayload)
	if (!parseResult.success) {
		return json(
			{
				success: false,
				fieldErrors:
					parseResult.error.formErrors.fieldErrors,
			},
			{status: 422},
		)
	}
	const {name, username} = parseResult.data

	const newUser = await updateUsername({
		id: sessionUser.id,
		name,
		username: username,
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
		{success: true, fieldErrors: null},
		{headers: {'Set-Cookie': await commitSession()}},
	)
}

export default function ConfigPage() {
	const {user, ignored: ignoredList} =
		useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const nav = useNavigation()
	const ignoredFetcher = useFetcher()
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
						aria-describedby={
							actionData?.fieldErrors?.name &&
							`name-error${id}`
						}
					/>
					{actionData?.fieldErrors?.name && (
						<AlertClosable
							key={nav.state}
							variant='destructive'
							role='alert'
							id={`name-error${id}`}
						>
							{actionData?.fieldErrors?.name}
						</AlertClosable>
					)}
					<Label htmlFor={`username${id}`}>
						Username (@)
					</Label>
					<Input
						id={`username${id}`}
						name='username'
						defaultValue={user.username}
						maxLength={30}
						aria-describedby={
							actionData?.fieldErrors?.username &&
							`username-error${id}`
						}
					/>
					{actionData?.fieldErrors?.username && (
						<AlertClosable
							key={nav.state}
							variant='destructive'
							role='alert'
							id={`username-error${id}`}
						>
							<Join separator={<br />}>
								{actionData?.fieldErrors?.username}
							</Join>
						</AlertClosable>
					)}
					<div className='self-stretch mt-2 flex items-start flex-row-reverse justify-between align-start gap-2'>
						<Button
							variant='secondary'
							type='submit'
							disabled={nav.state !== 'idle'}
						>
							{nav.state !== 'idle' && (
								<ShellIcon className='mr-2 h-4 w-4 motion-safe:animate-[spin_2s_linear_infinite_reverse]' />
							)}
							Salvar dados
						</Button>
						{actionData?.success && (
							<AlertClosable
								className='self-start'
								key={nav.state}
							>
								Alterações feitas com sucesso!
							</AlertClosable>
						)}
					</div>
				</Form>
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

			<CardHeader>
				<CardTitle>Exportar</CardTitle>
			</CardHeader>
			<CardContent>
				<span>Baixar seus dados em</span>
				<div>
					<a href='/data/bgp-data.csv' download>
						CSV
					</a>
					<a href='/data/bgp-data.json' download>
						JSON
					</a>
				</div>
			</CardContent>
		</Card>
	)
}
