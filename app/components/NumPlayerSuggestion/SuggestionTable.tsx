import {
	HeartIcon,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from 'lucide-react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../ui/table'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '../ui/tooltip'
import {
	TSuggestion,
	getPercentages,
	percentFormatter,
} from './utils'
import {cn} from '~/lib/utils'

export function SuggestionTable({
	suggestions: numPlayerSuggestion,
	pickedSuggestion,
}: {
	suggestions: TSuggestion[]
	pickedSuggestion?: TSuggestion
}) {
	return (
		<TooltipProvider>
			<Table>
				<TableHeader>
					<TableHead>Jogadores</TableHead>
					<TableHead>
						<Tooltip>
							<TooltipTrigger>
								<HeartIcon />
							</TooltipTrigger>
							<TooltipContent>Supremo</TooltipContent>
						</Tooltip>
					</TableHead>
					<TableHead>
						<Tooltip>
							<TooltipTrigger>
								<ThumbsUpIcon />
							</TooltipTrigger>
							<TooltipContent>Recomendado</TooltipContent>
						</Tooltip>
					</TableHead>
					<TableHead>
						<Tooltip>
							<TooltipTrigger>
								<ThumbsDownIcon />
							</TooltipTrigger>
							<TooltipContent>
								Não recomendado
							</TooltipContent>
						</Tooltip>
					</TableHead>
				</TableHeader>
				<TableBody>
					{numPlayerSuggestion
						.concat()
						// highlights picked suggestion
						.sort((a, b) =>
							a.numPlayers === pickedSuggestion?.numPlayers
								? -1
								: b.numPlayers ===
									  pickedSuggestion?.numPlayers
									? 1
									: 0,
						)
						.map((s) => ({
							...s,
							percent: getPercentages(s),
						}))
						.map((suggestion) => (
							<TableRow
								key={suggestion.numPlayers}
								className={cn(
									suggestion.numPlayers ===
										pickedSuggestion?.numPlayers &&
										'bg-accent text-accent-foreground',
								)}
							>
								<TableCell>
									{suggestion.numPlayers}
								</TableCell>
								<TableCell>
									{percentFormatter.format(
										suggestion.percent.best,
									)}{' '}
									({suggestion.best})
								</TableCell>
								<TableCell>
									{percentFormatter.format(
										suggestion.percent.recommended,
									)}{' '}
									({suggestion.recommended})
								</TableCell>
								<TableCell>
									{percentFormatter.format(
										suggestion.percent.notRecommended,
									)}{' '}
									({suggestion.notRecommended})
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
		</TooltipProvider>
	)
}
