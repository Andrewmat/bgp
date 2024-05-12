import {useFetcher} from '@remix-run/react'
import {MegaphoneOffIcon} from 'lucide-react'
import {EvaluationForm} from '~/components/EvaluationForm'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import {BggBoardgame} from '~/lib/bgg'

export function EvaluationFormRecommendation({
	game,
	score,
}: {
	game: BggBoardgame
	score: number | undefined
}) {
	const fetcher = useFetcher()
	return (
		<EvaluationForm
			gameId={game.id}
			score={score}
			side={
				<fetcher.Form
					action={`/game/${game.id}/relation`}
					method='POST'
					className='flex items-center justify-center w-full h-full'
				>
					<input
						type='hidden'
						name='intent'
						value='ignore'
					/>
					<input type='hidden' name='value' value='true' />
					<Tooltip>
						<TooltipTrigger type='submit'>
							<MegaphoneOffIcon className='stroke-muted-foreground hover:stroke-destructive-foreground hover:fill-destructive focus-visible:stroke-destructive-foreground focus-visible:fill-destructive' />
						</TooltipTrigger>
						<TooltipContent>
							Silenciar recomendação
						</TooltipContent>
					</Tooltip>
				</fetcher.Form>
			}
		/>
	)
}
