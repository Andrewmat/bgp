import {DicesIcon, UnfoldHorizontalIcon} from 'lucide-react'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './ui/tooltip'

export function Stats({values}: {values: number[]}) {
	const sum = values.reduce((s, n) => s + n, 0)
	const avg = sum / values.length
	const varp =
		values.reduce((s, ts) => s + Math.pow(ts - avg, 2), 0) /
		values.length

	return (
		<TooltipProvider>
			<small className='text-muted-foreground'>
				({values.length}{' '}
				{values.length > 1 ? 'votos' : 'voto'})
			</small>
			<Tooltip>
				<TooltipTrigger asChild>
					<span className='flex gap-2'>
						<DicesIcon />
						<span>{avg.toFixed(2)}</span>
					</span>
				</TooltipTrigger>
				<TooltipContent>Média</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<span className='flex gap-2'>
						<UnfoldHorizontalIcon />
						<span>{varp.toFixed(2)}</span>
					</span>
				</TooltipTrigger>
				<TooltipContent>Variância padrão</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
