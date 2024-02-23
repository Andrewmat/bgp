import {Link} from '@remix-run/react'
import {ExternalLink} from 'lucide-react'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/ui/avatar'
import {CardHeader, CardTitle} from '~/components/ui/card'
import {BggBoardgame} from '~/lib/bgg'
import {EvaluationForm} from '~/components/EvaluationForm'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import {
	ComplexityDisplay,
	ScoreDisplay,
} from '~/components/DiceScore'

export function GameHeader(
	props: {
		game: BggBoardgame
	} & (
		| {showEvaluation: true; score: number | undefined}
		| {showEvaluation: false}
	),
) {
	const {game, showEvaluation} = props

	return (
		<>
			<CardHeader className='flex flex-col gap-2 sm:flex-row sm:justify-between'>
				<div className='flex gap-3'>
					<Avatar className='h-20 w-20'>
						<AvatarImage src={game.image} />
						<AvatarFallback>{game.name}</AvatarFallback>
					</Avatar>
					<CardTitle>
						{game.name}
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger className='ml-2'>
									<Link
										to={`https://boardgamegeek.com/boardgame/${game.id}`}
										target='_blank'
										rel='noreferrer'
									>
										<ExternalLink
											className='stroke-muted-foreground'
											size='0.8rem'
										/>
									</Link>
								</TooltipTrigger>
								<TooltipContent>
									Abrir no BoardGameGeek
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</CardTitle>
					{game.stats && (
						<div className='flex flex-col gap-1 justify-center'>
							<ScoreDisplay score={game.stats.average} />
							<ComplexityDisplay
								complexity={game.stats.averageWeight}
							/>
						</div>
					)}
				</div>
				<div className='w-[260px] md:w-[300px]'>
					{showEvaluation && (
						<EvaluationForm
							gameId={game.id}
							score={props.score}
							className='flex-row-reverse'
						/>
					)}
				</div>
			</CardHeader>
			<></>
		</>
	)
}
