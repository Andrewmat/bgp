import type {BggBoardgame} from '~/lib/bgg'
import {
	Card,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card'
import {Link} from '@remix-run/react'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from './ui/avatar'
import {ScoreDisplay} from './DiceScore'
import Pagination from './Pagination'
import {EvaluationForm} from './EvaluationForm'
import {TooltipProvider} from './ui/tooltip'

export type ScoreGame = {
	score: number
	game: BggBoardgame
}

const PAGE_SIZE = 12

export function Scores({
	scores,
	scorePage,
	canEditScore = false,
}: {
	scores: ScoreGame[]
	scorePage: number
	canEditScore?: boolean
}) {
	return (
		<>
			{scores.length > 0 ? (
				<ul className='grid grid-cols-1 gap-2 list-none sm:grid-cols-2 lg:grid-cols-3 lg:gap-3'>
					{scores.map((s) => (
						<li key={s.game.id}>
							<GameCard
								score={s.score}
								game={s.game}
								canEditScore={canEditScore}
							/>
						</li>
					))}
				</ul>
			) : (
				<div>Não encontramos nenhuma nota</div>
			)}
			<div className='mt-2'>
				<Pagination
					hasNext={scores.length === PAGE_SIZE}
					page={scorePage}
					searchParam='score_page'
				/>
			</div>
		</>
	)
}

type GameCardProps = {
	game: BggBoardgame
	score: number
	canEditScore?: boolean
}

export function GameCard({
	game,
	score,
	canEditScore,
}: GameCardProps) {
	return (
		<Card className='border-none border-r-0'>
			<CardHeader>
				<Link
					to={`/game/${game.id}`}
					className='flex gap-2 items-center hover:underline focus:underline'
				>
					<Avatar>
						<AvatarImage
							src={game.thumbnail}
							height='40'
							width='40'
						/>
						<AvatarFallback>{game.name}</AvatarFallback>
					</Avatar>
					<CardTitle>{game.name}</CardTitle>
				</Link>
			</CardHeader>
			<CardFooter>
				{canEditScore ? (
					<EvaluationForm gameId={game.id} score={score} />
				) : (
					<TooltipProvider>
						<ScoreDisplay score={score} />
					</TooltipProvider>
				)}
			</CardFooter>
		</Card>
	)
}
