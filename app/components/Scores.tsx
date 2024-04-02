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
import {TooltipProvider} from './ui/tooltip'
import {Skeleton} from './ui/skeleton'
import {ScoreGame} from '~/lib/score.type'
import {ReactElement, ReactNode, cloneElement} from 'react'
import {Alert} from './ui/alert'

export interface ScoresProps {
	page: number
	pageSize?: number
	pageParam?: string
	scores: ScoreGame[]
	empty?: ReactNode

	footer?: ReactElement<{
		score: number | undefined
		game: BggBoardgame
	}>
}

export function Scores({
	scores,
	page,
	pageSize = 12,
	pageParam = 'score_page',
	footer,
	empty = 'Nenhuma nota encontrada',
}: ScoresProps) {
	return (
		<>
			{scores.length > 0 ? (
				<ul className='grid grid-cols-1 gap-2 list-none sm:grid-cols-2 lg:grid-cols-3 lg:gap-3'>
					{scores.map((s) => (
						<li key={s.game.id}>
							<GameCard
								game={s.game}
								footer={
									footer ? (
										cloneElement(footer, {
											score: s.score,
											game: s.game,
										})
									) : s.score ? (
										<TooltipProvider>
											<ScoreDisplay score={s.score} />
										</TooltipProvider>
									) : null
								}
							/>
						</li>
					))}
				</ul>
			) : (
				<div className='p-6 pt-0'>
					<Alert variant='destructive'>{empty}</Alert>
				</div>
			)}
			<div className='mt-2'>
				<Pagination
					hasNext={scores.length === pageSize}
					page={page}
					searchParam={pageParam}
				/>
			</div>
		</>
	)
}

export function ScoresFallback({
	pageSize = 11,
}: {
	pageSize?: number
}) {
	return (
		<div className='flex flex-col gap-6'>
			<div className='grid grid-cols-1 gap-2 list-none sm:grid-cols-2 lg:grid-cols-3 lg:gap-3'>
				{Array.from({length: pageSize}).map((_, i) => (
					<Skeleton key={i} className='h-[160px]' />
				))}
			</div>
			<div className='flex justify-center gap-2'>
				<Skeleton className='w-[64px] h-[50px]' />
				<Skeleton className='w-[64px] h-[50px]' />
			</div>
		</div>
	)
}

interface GameCardProps {
	game: BggBoardgame
	footer: ReactNode
}

export function GameCard({game, footer}: GameCardProps) {
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
			<CardFooter>{footer}</CardFooter>
		</Card>
	)
}
