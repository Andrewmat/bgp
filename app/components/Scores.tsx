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
import {DiceScore} from './DiceScore'

export type ScoreGame = {
	score: number
	game: BggBoardgame
}

export function Scores({scores}: {scores: ScoreGame[]}) {
	return (
		<ul className='grid grid-cols-1 gap-2 list-none sm:grid-cols-2 lg:grid-cols-3 lg:gap-3'>
			{scores.map((s) => (
				<li key={s.game.id}>
					<GameCard score={s.score} game={s.game} />
				</li>
			))}
		</ul>
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
				<DiceScore score={score} />
			</CardFooter>
		</Card>
	)
}
