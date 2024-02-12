import {Link, useLoaderData} from '@remix-run/react'
import {ExternalLink} from 'lucide-react'
import invariant from 'tiny-invariant'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/ui/avatar'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {BggBoardgame, getGameId} from '~/lib/bgg'
import {
	getScoreByUserGame,
	getScoresFollowingGame,
} from '~/lib/db/score.server'
import {withUser} from '~/lib/remix/wrapUser'
import {EvaluationForm} from '~/components/EvaluationForm'
import {PlayersTable} from './PlayerSuggestionTable'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import {useMemo} from 'react'

export const loader = withUser(async ({params, user}) => {
	const gameId = params.gameId
	invariant(
		typeof gameId === 'string',
		'Could not read gameId',
	)
	const game = await getGameId(gameId)
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
		<div className='flex flex-col gap-4'>
			<GameBggInfo
				game={game as BggBoardgame}
				score={score}
				showEvaluation={Boolean(user)}
			/>
			{followingScore && followingScore.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Notas</CardTitle>
					</CardHeader>
					<CardContent>
						<strong>
							<Stats
								numbers={followingScore.map((s) => s.value)}
							/>
						</strong>
						<ul>
							{followingScore.map((s) => (
								<li key={s.user.id}>
									<Link to={`/user/${s.user.username}`}>
										{s.user.username}
									</Link>
									: {s.value}
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			)}
		</div>
	)
}

function Stats({numbers}: {numbers: number[]}) {
	const {mean, deviation} = useMemo(() => {
		const sum = numbers.reduce((s, x) => s + x, 0)
		const mean = sum / numbers.length
		const deviation =
			numbers.reduce((s, x) => Math.pow(x - mean, 2), 0) /
			numbers.length
		return {
			mean,
			deviation,
		}
	}, [numbers])

	return (
		<>
			&mu;: {mean}
			<br />
			&sigma;: {deviation}
		</>
	)
}

function GameBggInfo(
	props: {
		game: BggBoardgame
	} & (
		| {showEvaluation: true; score: number | undefined}
		| {showEvaluation: false}
	),
) {
	const {game, showEvaluation} = props
	return (
		<Card>
			<CardHeader className='flex flex-row justify-between'>
				<div className='flex gap-2'>
					<Avatar>
						<AvatarImage src={game.image} />
						<AvatarFallback>
							{game.name.slice(0, 2)}
						</AvatarFallback>
					</Avatar>
					<CardTitle>
						{game.name}
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger className='ml-2'>
									<Link
										to={`https://boardgamegeek.com/boardgame/${game.id}`}
										target='_blank'
										rel='noreferrer'
									>
										<ExternalLink
											className='stroke-muted-foreground'
											size='0.8rem'
										/>
									</Link>
								</TooltipTrigger>
								<TooltipContent>
									Abrir no BoardGameGeek
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</CardTitle>
				</div>
				<div className='w-[200px] md:w-[300px]'>
					{showEvaluation && (
						<EvaluationForm
							gameId={game.id}
							score={props.score}
							className='flex-row-reverse'
						/>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<div className='grid gap-2 md:grid-cols-4 lg:grid-cols-6'>
					<div>
						<RangeInfo
							min={game.minPlayers}
							max={game.maxPlayers}
							appendix={
								game.maxPlayers > 1
									? 'jogadores'
									: 'jogador'
							}
						/>
						<RangeInfo
							min={game.minPlayTime}
							max={game.maxPlayTime}
							appendix='min'
						/>
					</div>
					<div className='md:col-span-3 lg:col-span-5'>
						<Card>
							<PlayersTable game={game as BggBoardgame} />
						</Card>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

function RangeInfo({
	min,
	max,
	appendix,
}: {
	min: number
	max: number
	appendix: string
}) {
	return (
		<p>
			{min === max ? min : `${min} - ${max}`} {appendix}
		</p>
	)
}
