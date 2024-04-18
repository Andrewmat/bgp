import {
	Link,
	useLoaderData,
	useRouteLoaderData,
} from '@remix-run/react'
import {type loader as gameDetailsLoader} from '../_ml.game.$gameId'
import {Section} from './Section'
import {RangeInfo} from './RangeInfo'
import {SofaIcon, UserIcon} from 'lucide-react'
import {Stats} from '~/components/Stats'
import {GroupTable} from './GroupTable'
import {LoaderFunctionArgs, json} from '@remix-run/node'
import {getScoresGroup} from '~/lib/db/score.server'
import {getFollowing} from '~/lib/db/follow.server'
import invariant from 'tiny-invariant'
import {getOnSession} from '~/lib/login/session.server'
import {getSessionUser} from '~/lib/login/auth.server'

export async function loader({
	params,
	request,
}: LoaderFunctionArgs) {
	const {gameId} = params
	invariant(gameId, 'Could not read gameId')
	const user = await getSessionUser(request)
	if (user?.id == null) {
		return json({
			tableScore: null,
			followingScore: null,
		})
	}

	const table = await getOnSession(request, 'table')
	const [tableScore, followingScore] = await Promise.all([
		table
			? getScoresGroup({
					gameId,
					userIds: table.map((t) => t.id),
				})
			: null,
		getFollowing({followedById: user.id}).then(
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

	return json({tableScore, followingScore})
}

export default function GameDetailsIndexPage() {
	const {followingScore, tableScore} =
		useLoaderData<typeof loader>()
	const gameLoaderData = useRouteLoaderData<
		typeof gameDetailsLoader
	>('routes/_ml.game.$gameId')

	if (gameLoaderData == null) {
		// Not expected
		return null
	}

	const {game} = gameLoaderData

	return (
		<div className='flex flex-col gap-6'>
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
			{game.mechanics.length > 0 && (
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
			)}
			{followingScore && followingScore.length > 0 && (
				<Section
					title={
						<span className='flex gap-2 items-center'>
							<UserIcon /> Seguindo
						</span>
					}
				>
					<div className='flex gap-6'>
						<div className='flex flex-col gap-2 items-start justify-start'>
							<small className='text-muted-foreground'>
								({followingScore.length}{' '}
								{followingScore.length > 1
									? 'votos'
									: 'voto'}
								)
							</small>
							<Stats
								values={followingScore.map((s) => s.value)}
							/>
						</div>
						<div>
							<GroupTable groupScore={followingScore} />
						</div>
					</div>
				</Section>
			)}
			{tableScore && tableScore.length > 0 && (
				<Section
					title={
						<span className='flex gap-2 items-center'>
							<SofaIcon /> Mesa
						</span>
					}
				>
					<div className='flex gap-6'>
						<div className='flex flex-col gap-2 items-start justify-start'>
							<small className='text-muted-foreground'>
								({tableScore.length}{' '}
								{tableScore.length > 1 ? 'votos' : 'voto'})
							</small>
							<Stats
								values={tableScore.map((s) => s.value)}
							/>
						</div>
						<div>
							<GroupTable groupScore={tableScore} />
						</div>
					</div>
				</Section>
			)}
		</div>
	)
}
