import {
	Link,
	isRouteErrorResponse,
	useLoaderData,
	useParams,
	useRouteError,
} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {Card} from '~/components/ui/card'
import {BggBoardgame, getGameId} from '~/lib/bgg'
import {
	getScoreByUserGame,
	getScoresFollowingGame,
} from '~/lib/db/score.server'
import {withUser} from '~/lib/remix/wrapUser'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import {ScoreDisplay} from '~/components/DiceScore'
import {Stats} from '~/components/Stats'
import {RangeInfo} from './RangeInfo'
import {Section} from './Section'
import {GameHeader} from './GameHeader'
import {Alert} from '~/components/ui/alert'

export const loader = withUser(async ({params, user}) => {
	const gameId = params.gameId
	invariant(
		typeof gameId === 'string',
		'Could not read gameId',
	)
	const game = await getGameId(gameId, true)
	let score: Awaited<
		ReturnType<typeof getScoreByUserGame>
	> = null
	let followingScore: Awaited<
		ReturnType<typeof getScoresFollowingGame>
	> | null = null

	if (user?.id) {
		score = await getScoreByUserGame({
			gameId,
			userId: user.id,
		})
		followingScore = await getScoresFollowingGame({
			gameId,
			userId: user.id,
		})
	}
	return {game, score: score?.value, followingScore}
})

export default function GameDetailsPage() {
	const {game, score, user, followingScore} =
		useLoaderData<typeof loader>()

	return (
		<Card className='flex flex-col gap-2 pb-6'>
			<GameHeader
				game={game as BggBoardgame}
				score={score}
				showEvaluation={Boolean(user)}
			/>

			<div className='flex flex-col gap-4'>
				<Section title='Geral'>
					<RangeInfo
						min={game.minPlayers}
						max={game.maxPlayers}
						appendix={
							game.maxPlayers > 1 ? 'jogadores' : 'jogador'
						}
					/>
					<RangeInfo
						min={game.minPlayTime}
						max={game.maxPlayTime}
						appendix='min'
					/>
					{game.bga.implemented && <em>Tem no BGA!</em>}
				</Section>
				<Section title='Mecânicas'>
					<div className='text-muted-foreground'>
						{game.mechanics.map((m) => (
							<div key={m.id}>
								<Link
									to={`https://boardgamegeek.com/boardgamemechanic/${m.id}`}
									rel='noreferrer'
									className='hover:underline focus:underline'
								>
									{m.label}
								</Link>
							</div>
						))}
					</div>
				</Section>
			</div>
			{followingScore && followingScore.length > 0 && (
				<Section title='Seguindo'>
					<div className='flex gap-6'>
						<div className='flex flex-col gap-2 items-start justify-start'>
							<Stats
								values={followingScore.map((s) => s.value)}
							/>
						</div>
						<Table className='flex-grow'>
							<TableHeader>
								<TableHead>Usuário</TableHead>
								<TableHead className='text-center'>
									Nota
								</TableHead>
							</TableHeader>
							<TableBody>
								{followingScore.map((fs) => (
									<TableRow key={fs.user.id}>
										<TableCell className='p-1'>
											{fs.user.name}
										</TableCell>
										<TableCell className='p-1 text-center'>
											<ScoreDisplay score={fs.value} />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</Section>
			)}
		</Card>
	)
}

export function ErrorBoundary() {
	const error = useRouteError()
	const {gameId} = useParams()
	if (isRouteErrorResponse(error)) {
		return (
			<Alert>
				{error.status === 404
					? `Não foi encontrado jogo '${gameId}'`
					: 'Houve um erro ao carregar esse jogo'}
			</Alert>
		)
	}
	return <div>Houve um erro ao carregar essa página</div>
}
