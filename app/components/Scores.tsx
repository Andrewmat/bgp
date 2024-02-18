import type {BggBoardgame} from '~/lib/bgg'
import {
	Card,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card'
import {Link, useLocation} from '@remix-run/react'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from './ui/avatar'
import {ScoreDisplay} from './DiceScore'
import {ArrowLeftIcon, ArrowRightIcon} from 'lucide-react'
import SLink from './ui/SLink'
import {Button} from './ui/button'

export type ScoreGame = {
	score: number
	game: BggBoardgame
}

export function Scores({
	scores,
	scorePage,
}: {
	scores: ScoreGame[]
	scorePage: number
}) {
	const {pathname, search} = useLocation()
	const prevParams = new URLSearchParams(search)
	prevParams.set('score_page', String(scorePage - 1))
	const nextParams = new URLSearchParams(search)
	nextParams.set('score_page', String(scorePage + 1))

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
			)}{' '}
			<div className='flex gap-2 justify-center'>
				{scorePage !== 1 ? (
					<SLink
						to={`${pathname}?${prevParams}`}
						variant='ghost'
					>
						<ArrowLeftIcon />
						<span className='sr-only'>Anterior</span>
					</SLink>
				) : (
					<Button variant='ghost' disabled>
						<ArrowLeftIcon />
						<span className='sr-only'>Anterior</span>
					</Button>
				)}
				{scores.length === 12 ? (
					<SLink
						to={`${pathname}?${nextParams}`}
						variant='ghost'
					>
						<ArrowRightIcon />
						<span className='sr-only'>Próximo</span>
					</SLink>
				) : (
					<Button variant='ghost' disabled>
						<ArrowRightIcon />
						<span className='sr-only'>Próximo</span>
					</Button>
				)}
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
