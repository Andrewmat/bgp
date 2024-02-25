import {DicesIcon, UnfoldHorizontalIcon} from 'lucide-react'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './ui/tooltip'

export function Stats({
	values,
	averageLabel = 'Média',
	stdDevLabel = 'Variância Padrão',
}: {
	values: number[]
	averageLabel?: React.ReactNode
	stdDevLabel?: React.ReactNode
}) {
	const sum = values.reduce((s, n) => s + n, 0)
	const avg = sum / values.length
	const varp =
		values.reduce((s, ts) => s + Math.pow(ts - avg, 2), 0) /
		values.length

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<span className='flex gap-2'>
						<DicesIcon />
						<span>{avg.toFixed(2)}</span>
					</span>
				</TooltipTrigger>
				<TooltipContent>{averageLabel}</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<span className='flex gap-2'>
						<UnfoldHorizontalIcon />
						<span>{varp.toFixed(2)}</span>
					</span>
				</TooltipTrigger>
				<TooltipContent>{stdDevLabel}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
