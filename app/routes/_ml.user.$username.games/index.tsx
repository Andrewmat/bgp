import {LoaderFunctionArgs, json} from '@remix-run/node'
import {
	Form,
	Link,
	useLoaderData,
	useSubmit,
} from '@remix-run/react'
import {useMemo, useRef} from 'react'
import invariant from 'tiny-invariant'
import {
	getScoreValueGame,
	getScoresByUser,
} from '~/lib/db/score.server'
import {ScoreGame} from '~/lib/db/score.type'
import {getUserByUsername} from '~/lib/db/user.server'
import {
	type Filter,
	getFilterFromSearch,
	getFilterFromForm,
} from './filter'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import {InfiniteGamelist} from '~/components/InfiniteGamelist'
import {TooltipProvider} from '@radix-ui/react-tooltip'
import {
	Card,
	CardFooter,
	CardHeader,
} from '~/components/ui/card'
import {GameLink} from '~/components/GameLink'
import {ScoreDisplay} from '~/components/ScoreDisplay'

export async function loader({
	params,
	request,
}: LoaderFunctionArgs) {
	invariant(params.username, 'Expected username')
	const url = new URL(request.url)
	const page = Number(url.searchParams.get('page') ?? '1')
	const pageSize = Math.min(
		Number(url.searchParams.get('pageSize') ?? '12'),
		12,
	)
	const filter = getFilterFromSearch(url.searchParams)
	const userFromPage = await getUserByUsername(
		params.username,
	)

	if (!userFromPage) {
		throw new Response('Not found', {status: 404})
	}

	const skip = (page - 1) * pageSize

	const {result: scores, count} = await getScoresByUser({
		userId: userFromPage.id,
		skip,
		take: pageSize,
		orderBy: filter.orderBy,
	})

	const games = await getScoreValueGame(scores)

	return json({
		username: userFromPage.username,
		games,
		page,
		pageSize,
		hasMore: skip + games.length < count,
		filter,
	})
}

export default function UserGamelistPage() {
	const loaderData = useLoaderData<typeof loader>()

	const hashFilter = useMemo(
		() => JSON.stringify(loaderData.filter),
		[loaderData.filter],
	)

	return (
		<div className='flex flex-col gap-6'>
			<FilterPanel applied={loaderData.filter} />
			<InfiniteGamelist
				hasMore={loaderData.hasMore}
				page={loaderData.page}
				pageSize={loaderData.pageSize}
				games={loaderData.games as ScoreGame[]}
				key={hashFilter}
			>
				{({games}) => (
					<Gamelist
						username={loaderData.username}
						games={games}
					/>
				)}
			</InfiniteGamelist>
		</div>
	)
}

function FilterPanel({applied}: {applied: Filter}) {
	const submit = useSubmit()
	const appliedForm = useMemo(
		() => getFilterFromForm(applied),
		[applied],
	)
	const formRef = useRef<HTMLFormElement>(null)

	return (
		<Form ref={formRef} method='GET' className='flex gap-6'>
			<div className='ms-auto flex flex-col gap-2'>
				<Select
					name='ob'
					defaultValue={appliedForm.get('ob') as string}
					onValueChange={() => {
						submit(formRef.current)
					}}
				>
					<SelectTrigger
						className='w-[200px]'
						aria-label='Ordenar por'
					>
						<SelectValue placeholder='Ordenar por' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='best'>Melhores</SelectItem>
						<SelectItem value='recent'>Recentes</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</Form>
	)
}

function Gamelist({
	games,
	username,
}: {
	username: string
	games: ScoreGame[]
}) {
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
								<Link
									to={`/user/${username}/review/${game.id}`}
								>
									<ScoreDisplay score={score!} />
								</Link>
							</CardFooter>
						</Card>
					</li>
				))}
			</ul>
		</TooltipProvider>
	)
}
