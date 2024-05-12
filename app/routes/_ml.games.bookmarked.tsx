import {LoaderFunctionArgs, json} from '@remix-run/node'
import {
	Form,
	useFetcher,
	useLoaderData,
	useSubmit,
} from '@remix-run/react'
import {
	AlertTriangleIcon,
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
import {getScoreValueGame} from '~/lib/db/score.server'
import {ScoreGame} from '~/lib/db/score.type'
import {assertAuthenticated} from '~/lib/login/auth.server'
import {action} from './game.$gameId.relation'
import {cn} from '~/lib/utils'
import NumPlayersSelect from '~/components/filters/num-players'
import {Separator} from '~/components/ui/separator'

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
	const numPlayers =
		Number(url.searchParams.get('np')) || undefined
	const skip = (page - 1) * pageSize
	const {result, count} = await getAllBookmarkedGames({
		userId: user.id,
		skip: (page - 1) * pageSize,
		take: pageSize,
		numPlayers,
	})
	const games = await getScoreValueGame(
		result.map((r) => ({gameId: r, value: undefined})),
	)

	return json({
		games,
		filterHash: btoa(JSON.stringify({numPlayers})),
		page,
		pageSize,
		hasMore: skip + games.length < count,
	})
}

export default function BookmarkedGamesPage() {
	const {games, filterHash, hasMore, page, pageSize} =
		useLoaderData<typeof loader>()
	const submit = useSubmit()
	return (
		<div className='flex flex-col gap-6'>
			<Form
				onChange={(e) => {
					submit(e.currentTarget)
				}}
			>
				<NumPlayersSelect />
			</Form>
			<Separator />
			<InfiniteGamelist
				hasMore={hasMore}
				page={page}
				pageSize={pageSize}
				games={games as ScoreGame[]}
				key={filterHash}
			>
				{({games}) => <Gamelist games={games} />}
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
				? 'Jogo salvo com sucesso'
				: 'Removidos dos jogos salvos com sucesso',
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
										? 'Salvar jogo'
										: 'Remover dos jogos salvos'}
								</TooltipContent>
							</Tooltip>
						</bookmarkFetcher.Form>
					}
				/>
			</CardFooter>
		</Card>
	)
}

export function ErrorBoundary() {
	return (
		<div className='p-6'>
			<h2 className='text-xl flex gap-2'>
				<AlertTriangleIcon />
				Ops
			</h2>
			<span className='text-lg'>
				Houve um erro ao carregar a sua lista de jogos
				salvos
			</span>
		</div>
	)
}
