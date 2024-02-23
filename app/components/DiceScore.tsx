import {
	EggIcon,
	HammerIcon,
	PencilRulerIcon,
	StarIcon,
} from 'lucide-react'
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
						{score.toFixed(2)}
					</span>
				</TooltipTrigger>
				<TooltipContent>
					Nota {score.toFixed(2)}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}

export function ComplexityDisplay({
	complexity,
}: {
	complexity: number
}) {
	const isEasy = complexity < 2
	const isHard = complexity >= 4
	const isMedium = !isEasy && !isHard
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger className='inline-flex gap-2 items-center'>
					{isEasy && (
						<EggIcon
							size='1em'
							className='fill-green-700 stroke-green-900'
						/>
					)}
					{isMedium && <PencilRulerIcon size='1em' />}
					{isHard && (
						<HammerIcon
							size='1em'
							className='fill-red-500 stroke-red-900'
						/>
					)}
					<span className='font-bold'>
						{complexity.toFixed(2)}
					</span>
				</TooltipTrigger>
				<TooltipContent>
					Complexidade {complexity.toFixed(2)}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
