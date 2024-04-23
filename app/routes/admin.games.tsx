import {BggGame} from '@prisma/client'
import {Label} from '@radix-ui/react-label'
import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	SerializeFrom,
	json,
} from '@remix-run/node'
import {
	Form,
	Link,
	useActionData,
	useLoaderData,
} from '@remix-run/react'
import {useEffect} from 'react'
import {toast} from 'sonner'
import {Alert} from '~/components/ui/alert'
import {Button} from '~/components/ui/button'
import {Input} from '~/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import {BggBoardgame, getGameId} from '~/lib/bgg'
import {
	searchGames,
	upsertBggGames,
} from '~/lib/db/games.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const searchTerm = new URL(request.url).searchParams.get(
		'q',
	)
	const games = await searchGames(searchTerm ?? undefined)
	return json({games})
}

export async function action({
	request,
}: ActionFunctionArgs) {
	const formData = await request.formData()
	const intent = formData.get('intent')
	switch (intent) {
		case 'patch': {
			const externalId = formData.get(
				'externalId',
			) as string
			let game: BggBoardgame
			try {
				game = await getGameId(externalId)
				if (!game.id) {
					throw new Error()
				}
			} catch {
				return json({
					game: null,
					errorMessage: `Jogo '${externalId}' não encontrado`,
				})
			}
			await upsertBggGames([game])
			return json({
				game,
				errorMessage: null,
			})
		}
		default: {
			return json({
				game: null,
				errorMessage: `Intent '${intent}' inesperado`,
			})
		}
	}
}

export default function AdminGamesPage() {
	const {games} = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()

	useEffect(() => {
		if (actionData?.game) {
			toast.success(
				`Inserido ${actionData.game.name} com sucesso`,
			)
		}
	}, [actionData])

	if (games.length <= 0) {
		return <Alert>Nenhum jogo encontrado</Alert>
	}
	const properties = Object.keys(
		games[0],
	) as (keyof (typeof games)[number])[]
	return (
		<div className='flex flex-col gap-3'>
			<div>
				<h2 className='text-xl mb-3'>Adicionar jogo</h2>
				<Form method='POST' className='flex gap-3'>
					<input
						type='hidden'
						name='intent'
						value='patch'
					></input>
					<Label htmlFor='externalIdField'>Id do BGG</Label>
					<Input name='externalId' id='externalIdField' />
					{actionData?.errorMessage && (
						<Alert variant='destructive'>
							{actionData.errorMessage}
						</Alert>
					)}
					<Button type='submit'>Enviar</Button>
				</Form>
			</div>
			<div>
				{' '}
				<h2 className='text-xl'>Listagem</h2>
				<Table>
					<TableHeader>
						{properties.map((property) => (
							<TableHead key={property}>
								{property}
							</TableHead>
						))}
					</TableHeader>
					<TableBody>
						{games.map((game) => (
							<TableRow key={game.id}>
								{properties.map((property) => (
									<TableCell key={property}>
										<FormatValue
											property={property}
											game={game}
										/>
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}

function FormatValue({
	game,
	property,
}: {
	game: SerializeFrom<BggGame>
	property: keyof typeof game
}) {
	switch (property) {
		case 'externalId': {
			return (
				<>
					{game[property]}
					<Link
						to={`https://boardgamegeek.com/boardgame/${game.externalId}`}
						target='_blank'
						rel='noreferrer'
						className='ml-2'
					>
						BGG
					</Link>
				</>
			)
		}
		case 'image':
		case 'thumbnail': {
			return (
				<img
					src={game[property]}
					height='50'
					width='50'
					alt={`${game.name} ${property}`}
				/>
			)
		}
		case 'createdAt':
		case 'updatedAt': {
			return new Date(game[property]).toISOString()
		}
		default:
			return game[property]
	}
}
