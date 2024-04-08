import {Link, useFetcher} from '@remix-run/react'
import {
	BookmarkMinusIcon,
	BookmarkPlusIcon,
	ExternalLink,
	MegaphoneIcon,
	MegaphoneOffIcon,
	MoreVerticalIcon,
} from 'lucide-react'
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {Button} from '~/components/ui/button'
import {action} from '../game.$gameId.relation'

export function GameHeader(
	props: {
		game: BggBoardgame
		isIgnored: boolean
		isBookmarked: boolean
	} & (
		| {showActions: true; score: number | undefined}
		| {showActions: false}
	),
) {
	const {game, showActions, isIgnored, isBookmarked} = props

	return (
		<>
			<CardHeader className='flex flex-col gap-2 sm:flex-row sm:justify-between'>
				<div className='flex gap-3'>
					<Avatar className='h-20 w-20'>
						<AvatarImage
							src={game.thumbnail}
							height='80'
							width='80'
						/>
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
						<div className='flex flex-col gap-1 justify-center items-end'>
							<TooltipProvider>
								<ScoreDisplay
									score={game.stats.average}
									tooltipContent={`Nota do BGG: ${game.stats.average.toFixed(2)}`}
								/>
								<ComplexityDisplay
									complexity={game.stats.averageWeight}
									tooltipContent={`Complexidade do BGG: ${game.stats.averageWeight.toFixed(2)}`}
								/>
							</TooltipProvider>
						</div>
					)}
				</div>
				<div className='flex gap-2 items-center'>
					<div className='w-[260px] md:w-[300px]'>
						{showActions && (
							<EvaluationForm
								gameId={game.id}
								score={props.score}
								className='flex-row-reverse'
							/>
						)}
					</div>
					{showActions && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='ghost' className='px-2'>
									<MoreVerticalIcon />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem>
									<BookmarkItem
										gameId={game.id}
										isBookmarked={isBookmarked}
									/>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<IgnoreItem
										gameId={game.id}
										isIgnored={isIgnored}
									/>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</CardHeader>
			<></>
		</>
	)
}

function IgnoreItem({
	gameId,
	isIgnored: loaderIsIgnored,
}: {
	gameId: string
	isIgnored: boolean
}) {
	const fetcher = useFetcher<typeof action>()
	const isIgnored = fetcher.data?.ignored ?? loaderIsIgnored
	return (
		<fetcher.Form
			action={`/game/${gameId}/relation`}
			method='POST'
		>
			<input type='hidden' name='intent' value='ignore' />
			<input
				type='hidden'
				name='value'
				value={isIgnored ? 'false' : 'true'}
			/>
			<button
				type='submit'
				className='appearance-none w-full flex items-center gap-2'
			>
				{isIgnored ? (
					<>
						<MegaphoneIcon />
						Remover silêncio
					</>
				) : (
					<>
						<MegaphoneOffIcon />
						Silenciar jogo
					</>
				)}
			</button>
		</fetcher.Form>
	)
}

function BookmarkItem({
	gameId,
	isBookmarked: loaderIsBookmarked,
}: {
	gameId: string
	isBookmarked: boolean
}) {
	const fetcher = useFetcher<typeof action>()
	const isBookmarked =
		fetcher.data?.bookmarked ?? loaderIsBookmarked
	return (
		<fetcher.Form
			action={`/game/${gameId}/relation`}
			method='POST'
		>
			<input type='hidden' name='intent' value='bookmark' />
			<input
				type='hidden'
				name='value'
				value={isBookmarked ? 'false' : 'true'}
			/>
			<button
				type='submit'
				className='appearance-none w-full flex items-center gap-2'
			>
				{isBookmarked ? (
					<>
						<BookmarkMinusIcon />
						Remover dos jogos salvos
					</>
				) : (
					<>
						<BookmarkPlusIcon />
						Salvar jogo
					</>
				)}
			</button>
		</fetcher.Form>
	)
}
