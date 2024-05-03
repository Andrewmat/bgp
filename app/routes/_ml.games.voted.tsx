import {LoaderFunctionArgs, json} from '@remix-run/node'
import {
	Form,
	useLoaderData,
	useSubmit,
} from '@remix-run/react'
import {EvaluationForm} from '~/components/EvaluationForm'
import {GameLink} from '~/components/GameLink'
import {InfiniteGamelist} from '~/components/InfiniteGamelist'
import NumPlayersSelect from '~/components/filters/num-players'
import {
	Card,
	CardFooter,
	CardHeader,
} from '~/components/ui/card'
import {Separator} from '~/components/ui/separator'
import {TooltipProvider} from '~/components/ui/tooltip'
import {
	getScoreValueGame,
	getScoresByUser,
} from '~/lib/db/score.server'
import {ScoreGame} from '~/lib/db/score.type'
import {assertAuthenticated} from '~/lib/login/auth.server'

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
	const {result: scores, count} = await getScoresByUser({
		userId: user.id,
		skip: (page - 1) * pageSize,
		take: pageSize,
		numPlayers,
	})
	const games = await getScoreValueGame(scores)

	return json({
		games,
		filterHash: btoa(JSON.stringify({numPlayers})),
		page,
		pageSize,
		numPlayers,
		hasMore: skip + games.length < count,
	})
}

export default function VotedGamesPage() {
	const {games, hasMore, filterHash, page, pageSize} =
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
			<div className='flex flex-col gap-6'>
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
		</div>
	)
}

function Gamelist({games}: {games: ScoreGame[]}) {
	return (
		<TooltipProvider>
			<ul className='grid grid-cols-1 gap-2 list-none sm:grid-cols-2 lg:grid-cols-3 lg:gap-3'>
				{games.map(({game, score}) => (
					<li key={game.id}>
						<Card>
							<CardHeader className='flex flex-nowrap'>
								<GameLink game={game} />
							</CardHeader>
							<CardFooter>
								<EvaluationForm
									gameId={game.id}
									score={score}
								/>
							</CardFooter>
						</Card>
					</li>
				))}
			</ul>
		</TooltipProvider>
	)
}
