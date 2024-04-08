import {LoaderFunctionArgs, json} from '@remix-run/node'
import {useFetcher, useLoaderData} from '@remix-run/react'
import {
	BookmarkMinusIcon,
	BookmarkPlusIcon,
} from 'lucide-react'
import {useEffect} from 'react'
import {toast} from 'sonner'
import {EvaluationForm} from '~/components/EvaluationForm'
import {GameLink} from '~/components/GameLink'
import {InfiniteGamelist} from '~/components/InfiniteGamelist'
import {
	Card,
	CardFooter,
	CardHeader,
} from '~/components/ui/card'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import {getAllBookmarkedGames} from '~/lib/db/gameuser.server'
import {getScoreGame} from '~/lib/db/score.server'
import {ScoreGame} from '~/lib/db/score.type'
import {assertAuthenticated} from '~/lib/login/auth.server'
import {action} from './game.$gameId.relation'
import {cn} from '~/lib/utils'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await assertAuthenticated(request)
	const url = new URL(request.url)
	const page = Number(url.searchParams.get('page') ?? '1')
	const pageSize = Math.min(
		Number(url.searchParams.get('pageSize') ?? '12'),
		12,
	)
	const skip = (page - 1) * pageSize
	const {result, count} = await getAllBookmarkedGames({
		userId: user.id,
		skip: (page - 1) * pageSize,
		take: pageSize,
	})
	const games = await getScoreGame(
		result.map((r) => ({gameId: r, value: undefined})),
	)

	return json({
		games,
		page,
		pageSize,
		hasMore: skip + games.length < count,
	})
}

export default function BookmarkedGamesPage() {
	const {games, hasMore, page, pageSize} =
		useLoaderData<typeof loader>()
	return (
		<div>
			<InfiniteGamelist
				hasMore={hasMore}
				page={page}
				pageSize={pageSize}
				games={games as ScoreGame[]}
			>
				{/* @ts-expect-error InfiniteGamelist injects props */}
				<Gamelist />
			</InfiniteGamelist>
		</div>
	)
}

function Gamelist({games}: {games: ScoreGame[]}) {
	return (
		<TooltipProvider>
			<ul className='grid grid-cols-1 gap-2 list-none sm:grid-cols-2 lg:grid-cols-3 lg:gap-3'>
				{games.map(({game, score}) => (
					<li key={game.id}>
						<GameCard game={game} score={score} />
					</li>
				))}
			</ul>
		</TooltipProvider>
	)
}

function GameCard({game, score}: ScoreGame) {
	const bookmarkFetcher = useFetcher<typeof action>()

	useEffect(() => {
		if (typeof bookmarkFetcher.data !== 'object') {
			return
		}

		toast.success(
			bookmarkFetcher.data.bookmarked
				? 'Jogo marcado com sucesso'
				: 'Jogo desmarcado com sucesso',
		)
	}, [bookmarkFetcher.data])

	const isBookmarked =
		bookmarkFetcher.data?.bookmarked ?? true

	return (
		<Card className={cn(!isBookmarked && 'opacity-60')}>
			<CardHeader className='flex flex-nowrap'>
				<GameLink game={game} />
			</CardHeader>
			<CardFooter>
				<EvaluationForm
					gameId={game.id}
					score={score}
					side={
						<bookmarkFetcher.Form
							method='POST'
							action={`/game/${game.id}/relation`}
							className='flex items-center justify-center w-full h-full'
						>
							<input
								type='hidden'
								name='intent'
								value='bookmark'
							/>
							<input
								type='hidden'
								name='value'
								value={String(!isBookmarked)}
							/>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type='submit'
										className='appearance-none w-full flex items-center gap-2'
									>
										{isBookmarked ? (
											<BookmarkMinusIcon className='fill-muted stroke-muted-foreground hover:fill-destructive hover:stroke-destructive-foreground focus-visible:fill-destructive focus-visible:stroke-destructive-foreground' />
										) : (
											<BookmarkPlusIcon className='fill-muted stroke-muted-foreground hover:fill-primary hover:stroke-primary-foreground focus-visible:fill-primary focus-visible:stroke-primary-foreground' />
										)}
									</button>
								</TooltipTrigger>
								<TooltipContent>
									{isBookmarked
										? 'Desmarcar jogo'
										: 'Marcar jogo'}
								</TooltipContent>
							</Tooltip>
						</bookmarkFetcher.Form>
					}
				/>
			</CardFooter>
		</Card>
	)
}
