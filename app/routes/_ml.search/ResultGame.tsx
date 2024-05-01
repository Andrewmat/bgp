import {Link, useFetcher} from '@remix-run/react'
import {ExternalLink} from 'lucide-react'
import {BggBoardgame, BggSearchResult} from '~/lib/bgg'
import {
	Card,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {cn} from '~/lib/utils'
import {
	ComplexityDisplay,
	ScoreDisplay,
} from '~/components/ScoreDisplay'
import {type loader} from '../_ml.game.$gameId'
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '~/components/ui/hover-card'
import {Skeleton} from '~/components/ui/skeleton'
import {RangeInfo} from '~/components/RangeInfo'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/ui/avatar'

export function ResultGame({
	game,
	score,
}: {
	game: BggSearchResult
	score: number | undefined
}) {
	const gameFetcher = useFetcher<typeof loader>()

	return (
		<HoverCard
			onOpenChange={(open) => {
				if (open && !gameFetcher.data) {
					gameFetcher.load(`/game/${game.id}`)
				}
			}}
		>
			<HoverCardTrigger>
				<GameItem game={game} score={score} />
			</HoverCardTrigger>
			<HoverCardContent>
				{gameFetcher.data ? (
					<GameCard
						game={gameFetcher.data.game as BggBoardgame}
					/>
				) : (
					<GameCardFallback />
				)}
			</HoverCardContent>
		</HoverCard>
	)
}

function GameItem({
	game,
	score,
}: {
	game: BggSearchResult
	score: number | undefined
}) {
	return (
		<div className='relative'>
			<Link
				to={`/game/${game.id}`}
				className={cn(
					'[&>*]:hover:bg-accent',
					'[&>*]:hover:text-accent-foreground',
					'[&>*]:focus-visible:bg-accent',
					'[&>*]:focus-visible:text-accent-foreground',
				)}
			>
				<Card className='p-5 h-full'>
					<div>
						{game.name} (
						<em>
							<small>{game.yearPublished}</small>
						</em>
						)
					</div>
					{score && (
						<div>
							<ScoreDisplay score={score} />
						</div>
					)}
				</Card>
			</Link>
			<Link
				to={`https://boardgamegeek.com/boardgame/${game.id}`}
				target='_blank'
				rel='noreferrer'
				className='absolute right-2 top-2'
			>
				<ExternalLink size='1rem' />
			</Link>
		</div>
	)
}

function GameCard({game}: {game: BggBoardgame}) {
	return (
		<Card className='border-none border-r-0'>
			<CardHeader className='px-0 pt-0'>
				<Link
					to={`/game/${game.id}`}
					className='flex gap-2 items-center hover:underline focus:underline'
				>
					<Avatar>
						<AvatarImage
							src={game.thumbnail}
							height='40'
							width='40'
						/>
						<AvatarFallback>{game.name}</AvatarFallback>
					</Avatar>
					<CardTitle className='text-lg'>
						{game.name}
					</CardTitle>
				</Link>
			</CardHeader>
			<CardFooter className='px-0 pb-0 flex flex-col items-start gap-2'>
				<RangeInfo
					min={game.minPlayers}
					max={game.maxPlayers}
					appendix='jogadores'
				/>

				{game.stats && (
					<div className='flex gap-6'>
						<ScoreDisplay score={game.stats.average} />
						<ComplexityDisplay
							complexity={game.stats.averageWeight}
						/>
					</div>
				)}
			</CardFooter>
		</Card>
	)
}

function GameCardFallback() {
	return (
		<div className='flex flex-col gap-4'>
			<div className='flex items-center gap-2'>
				<Skeleton className='w-[40px] h-[40px] rounded-full' />
				<div className='flex-1 flex flex-col gap-1'>
					<Skeleton className='h-4' />
					<Skeleton className='h-4 w-3/4' />
				</div>
			</div>
			<div className='flex flex-col gap-1'>
				<Skeleton className='h-3' />
				<Skeleton className='h-3' />
				<Skeleton className='h-3 w-3/4' />
			</div>
		</div>
	)
}
