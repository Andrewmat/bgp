import {StarIcon} from 'lucide-react'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './ui/tooltip'

export function ScoreDisplay({score}: {score: number}) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger className='inline-flex gap-2 items-center'>
					<StarIcon
						size='1em'
						className='fill-yellow-800 stroke-yellow-700'
					/>
					<span className='text-yellow-600 font-bold'>
						{score}
					</span>
				</TooltipTrigger>
				<TooltipContent>Nota {score}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
