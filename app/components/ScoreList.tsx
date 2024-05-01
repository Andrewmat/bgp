import type {BggBoardgame} from '~/lib/bgg'
import {ScoreDisplay} from './ScoreDisplay'
import Pagination from './Pagination'
import {TooltipProvider} from './ui/tooltip'
import {Skeleton} from './ui/skeleton'
import {ReactElement, ReactNode, cloneElement} from 'react'
import {Alert} from './ui/alert'
import {ScoreGame} from '~/lib/db/score.type'
import {GameCard} from './GameCard'

export interface ScoresProps {
	page: number
	pageSize?: number
	pageParam?: string
	scores: ScoreGame[]
	empty?: ReactNode
	noPagination?: boolean

	footer?: ReactElement<{
		score: number | undefined
		game: BggBoardgame
	}>
}

export function ScoreList({
	scores,
	page,
	pageSize = 12,
	pageParam = 'score_page',
	footer,
	empty = 'Nenhuma nota encontrada',
	noPagination = false,
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
			{!noPagination && (
				<div className='mt-2'>
					<Pagination
						hasNext={scores.length === pageSize}
						page={page}
						searchParam={pageParam}
					/>
				</div>
			)}
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
