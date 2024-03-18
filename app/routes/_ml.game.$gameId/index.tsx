import {
	Link,
	MetaFunction,
	isRouteErrorResponse,
	json,
	useLoaderData,
	useParams,
	useRouteError,
} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {Card} from '~/components/ui/card'
import {BggBoardgame, getGameId} from '~/lib/bgg'
import {
	getScoreByUserGame,
	getScoresGroup,
} from '~/lib/db/score.server'
import {Stats} from '~/components/Stats'
import {RangeInfo} from './RangeInfo'
import {Section} from './Section'
import {GameHeader} from './GameHeader'
import {Alert} from '~/components/ui/alert'
import {getSessionUser} from '~/lib/login/auth.server'
import {
	LinksFunction,
	LoaderFunctionArgs,
} from '@remix-run/node'
import {getFollowing} from '~/lib/db/follow.server'
import {getOnSession} from '~/lib/login/session.server'
import {GroupTable} from './GroupTable'

export const meta: MetaFunction<typeof loader> = ({
	data,
}) => {
	return [
		{
			title: data
				? `${data.game.name} | BGP`
				: 'Jogos de mesa | BGP',
		},
	]
}

export const links: LinksFunction = () => [
	{
		rel: 'dns-prefetch',
		href: 'https://cf.geekdo-images.com/',
	},
]

export const loader = async ({
	request,
	params,
}: LoaderFunctionArgs) => {
	const user = await getSessionUser(request)
	const gameId = params.gameId
	invariant(
		typeof gameId === 'string',
		'Could not read gameId',
	)
	const game = await getGameId(gameId, true)
	let score: Awaited<
		ReturnType<typeof getScoreByUserGame>
	> = null
	let groupScore: Awaited<
		ReturnType<typeof getScoresGroup>
	> | null = null
	let groupType: 'following' | 'table' | null = null

	if (user?.id) {
		const table = await getOnSession(request, 'table')

		;[score, groupScore] = await Promise.all([
			getScoreByUserGame({
				gameId,
				userId: user.id,
			}),
			table
				? getScoresGroup({
						gameId,
						userIds: table.map((t) => t.id),
					})
				: getFollowing({followedById: user.id}).then(
						(following) => {
							return getScoresGroup({
								gameId,
								userIds: following
									.map((f) => f.id)
									.concat(user.id),
							})
						},
					),
		])
		groupType = table ? 'table' : 'following'
	}
	return json({
		game,
		score: score?.value,
		groupType,
		groupScore,
		user,
	})
}

export default function GameDetailsPage() {
	const {game, score, user, groupScore, groupType} =
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
					<div className='flex flex-row'></div>
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
					{game.stats?.ranks.map((rank) => (
						<div key={rank.id}>
							<Link
								className='underline'
								target='_blank'
								rel='noreferrer'
								to={`https://boardgamegeek.com/${rank.name ? `${rank.name}/` : '/'}browse/boardgame?${new URLSearchParams(
									[
										['sort', 'rank'],
										['rankobjecttype', rank.type],
										['rankobjectid', rank.id],
										['rank', rank.value],
									],
								)}#${rank.value}`}
							>
								{rank.friendlyName}: {rank.value}
							</Link>
						</div>
					))}
				</Section>
				<Section title='Mecânicas'>
					<div className='text-muted-foreground'>
						{game.mechanics.map((m) => (
							<div key={m.id}>
								<Link
									to={`https://boardgamegeek.com/boardgamemechanic/${m.id}`}
									rel='noreferrer'
									target='_blank'
									className='hover:underline focus:underline'
								>
									{m.label}
								</Link>
							</div>
						))}
					</div>
				</Section>
			</div>
			{groupScore && groupScore.length > 0 && (
				<Section
					title={
						groupType === 'following' ? 'Seguindo' : 'Mesa'
					}
				>
					<div className='flex gap-6'>
						<div className='flex flex-col gap-2 items-start justify-start'>
							<small className='text-muted-foreground'>
								({groupScore.length}{' '}
								{groupScore.length > 1 ? 'votos' : 'voto'})
							</small>
							<Stats
								values={groupScore.map((s) => s.value)}
							/>
						</div>
						<GroupTable groupScore={groupScore} />
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
