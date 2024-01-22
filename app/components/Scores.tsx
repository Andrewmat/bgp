import type {BggBoardgame} from '~/lib/bgg'
import {
	Card,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card'
import {Link} from '@remix-run/react'
import {EvaluationForm} from './EvaluationForm'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from './ui/avatar'

export type ScoreGame = {
	score: number
	game: BggBoardgame
}

export function Scores({scores}: {scores: ScoreGame[]}) {
	return (
		<ul className='grid grid-cols-1 gap-2 list-none md:grid-cols-2 lg:grid-cols-3'>
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
				<Avatar>
					<AvatarImage src={game.thumbnail} />
					<AvatarFallback>{game.name}</AvatarFallback>
				</Avatar>
				<CardTitle>
					<Link to={`/game/${game.id}`}>{game.name}</Link>
				</CardTitle>
			</CardHeader>
			<CardFooter>
				<EvaluationForm gameId={game.id} score={score} />
			</CardFooter>
		</Card>
	)
}
