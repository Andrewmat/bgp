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
import {getScoreByUserGame} from '~/lib/db/score.server'
import {withUser} from '~/lib/remix/wrapUser'
import {EvaluationForm} from '~/components/EvaluationForm'
import {PlayersTable} from './PlayerSuggestionTable'

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

	if (user?.id) {
		score = await getScoreByUserGame({
			gameId,
			userId: user.id,
		})
	}
	return {game, score: score?.value}
})

export default function GameDetailsPage() {
	const {game, score, user} = useLoaderData<typeof loader>()
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
					<CardTitle>{game.name}</CardTitle>
					<Link
						to={`https://boardgamegeek.com/boardgame/${game.id}`}
						target='_blank'
						onClick={(e) => e.stopPropagation()}
						rel='noreferrer'
						className='mt-2'
					>
						<ExternalLink
							className='stroke-muted-foreground'
							size='0.8rem'
						/>
					</Link>
				</div>
				<div className='w-[200px] md:w-[300px]'>
					{user && (
						<EvaluationForm
							gameId={game.id}
							score={score}
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
