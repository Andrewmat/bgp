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
		<div className='container'>
			<ul className='px-3 grid grid-cols-1 gap-2 list-none sm:grid-cols-2 lg:grid-cols-3 lg:gap-3'>
				{scores.map((s) => (
					<li key={s.game.id}>
						<GameCard score={s.score} game={s.game} />
					</li>
				))}
			</ul>
		</div>
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
				<CardTitle>
					<Link
						to={`/game/${game.id}`}
						className='hover:underline flex gap-2 items-center'
					>
						<Avatar>
							<AvatarImage src={game.thumbnail} />
							<AvatarFallback>{game.name}</AvatarFallback>
						</Avatar>
						{game.name}
					</Link>
				</CardTitle>
			</CardHeader>
			<CardFooter>
				<div className='mx-auto max-w-sm'>
					<EvaluationForm gameId={game.id} score={score} />
				</div>
			</CardFooter>
		</Card>
	)
}
