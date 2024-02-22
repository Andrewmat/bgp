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

export type ScoreGame = {
	score: number
	game: BggBoardgame
}

const PAGE_SIZE = 12

export function Scores({
	scores,
	scorePage,
}: {
	scores: ScoreGame[]
	scorePage: number
}) {
	return (
		<>
			{scores.length > 0 ? (
				<ul className='grid grid-cols-1 gap-2 list-none sm:grid-cols-2 lg:grid-cols-3 lg:gap-3'>
					{scores.map((s) => (
						<li key={s.game.id}>
							<GameCard score={s.score} game={s.game} />
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
}

export function GameCard({game, score}: GameCardProps) {
	return (
		<Card>
			<CardHeader>
				<Link
					to={`/game/${game.id}`}
					className='flex gap-2 items-center hover:underline focus:underline'
				>
					<Avatar>
						<AvatarImage src={game.thumbnail} />
						<AvatarFallback>{game.name}</AvatarFallback>
					</Avatar>
					<CardTitle>{game.name}</CardTitle>
				</Link>
			</CardHeader>
			<CardFooter>
				<ScoreDisplay score={score} />
			</CardFooter>
		</Card>
	)
}
