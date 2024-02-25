import {
	SignalHighIcon,
	SignalLowIcon,
	SignalMediumIcon,
	StarIcon,
} from 'lucide-react'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from './ui/tooltip'
import {cn} from '~/lib/utils'

export function ScoreDisplay({
	score,
	tooltipContent = `Nota ${score.toFixed(2)}`,
}: {
	score: number
	tooltipContent?: React.ReactNode
}) {
	return (
		<Tooltip>
			<TooltipTrigger className='inline-flex gap-2 items-center'>
				<StarIcon
					size='1em'
					className='fill-yellow-800 stroke-yellow-700'
				/>
				<span className='text-yellow-600 font-bold'>
					{score.toFixed(2)}
				</span>
			</TooltipTrigger>
			<TooltipContent>{tooltipContent}</TooltipContent>
		</Tooltip>
	)
}

export function ComplexityDisplay({
	complexity,
	tooltipContent = `Complexidade ${complexity.toFixed(2)}`,
}: {
	complexity: number
	tooltipContent?: React.ReactNode
}) {
	const difficulty = (() => {
		switch (true) {
			case complexity < 2:
				return 'easy'
			case complexity < 3.5:
				return 'medium'
			default:
				return 'hard'
		}
	})()
	return (
		<Tooltip>
			<TooltipTrigger className='inline-flex gap-2 items-center'>
				{difficulty === 'easy' && (
					<SignalLowIcon
						size='1em'
						className={cn(
							'fill-blue-600 stroke-blue-600',
							'dark:fill-blue-500 dark:stroke-blue-500',
						)}
					/>
				)}
				{difficulty === 'medium' && (
					<SignalMediumIcon
						size='1em'
						className={cn(
							'fill-green-700 stroke-green-700',
							'dark:fill-green-600 dark:stroke-green-600',
						)}
					/>
				)}
				{difficulty === 'hard' && (
					<SignalHighIcon
						size='1em'
						className={cn(
							'fill-orange-700 stroke-orange-700',
							'dark:fill-orange-600 dark:stroke-orange-600',
						)}
					/>
				)}
				<span
					className={cn(
						'font-bold',
						difficulty === 'easy' &&
							'text-blue-600 dark:text-blue-500',
						difficulty === 'medium' &&
							'text-green-700 dark:text-green-600',
						difficulty === 'hard' &&
							'text-orange-700 dark:text-orange-600',
					)}
				>
					{complexity.toFixed(2)}
				</span>
			</TooltipTrigger>
			<TooltipContent>{tooltipContent}</TooltipContent>
		</Tooltip>
	)
}
