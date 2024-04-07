import {LoaderFunctionArgs, json} from '@remix-run/node'
import {
	Form,
	useLoaderData,
	useNavigation,
	useSubmit,
} from '@remix-run/react'
import {ShellIcon} from 'lucide-react'
import {useEffect, useMemo, useState} from 'react'
import invariant from 'tiny-invariant'
import {ScoreDisplay} from '~/components/DiceScore'
import {GameLink} from '~/components/GameLink'
import {Button} from '~/components/ui/button'
import {
	Card,
	CardFooter,
	CardHeader,
} from '~/components/ui/card'
import {
	ToggleGroup,
	ToggleGroupItem,
} from '~/components/ui/toggle-group'
import {TooltipProvider} from '~/components/ui/tooltip'
import {
	getScoreGame,
	getScoresByUser,
} from '~/lib/db/score.server'
import {ScoreGame} from '~/lib/db/score.type'
import {getUserByUsername} from '~/lib/db/user.server'
import {useFetcherWithReset} from '~/lib/useFetcherWithReset'

const pageSize = 12

export async function loader({
	params,
	request,
}: LoaderFunctionArgs) {
	invariant(params.username, 'Expected username')
	const url = new URL(request.url)
	const page = Number(url.searchParams.get('page') ?? '1')
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

	const userGames = await getScoreGame(scores)

	return json({
		userGames,
		page,
		count,
		hasMore: skip + userGames.length < count,
		filter,
	})
}

export default function UserGamelistPage() {
	const loaderData = useLoaderData<typeof loader>()
	const moreFetcher = useFetcherWithReset<typeof loader>()
	const [userGames, setUserGames] = useState(
		loaderData.userGames as ScoreGame[],
	)

	const hasMore =
		moreFetcher.data?.hasMore ?? loaderData.hasMore

	const page = moreFetcher.data?.page ?? loaderData.page

	// forces state to reset after form submission
	const {state: navState} = useNavigation()
	useEffect(() => {
		if (navState === 'idle') {
			setUserGames(loaderData.userGames as ScoreGame[])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [navState])

	useEffect(() => {
		if (moreFetcher.data) {
			const data = moreFetcher.data
			setUserGames((prev) => [
				...prev,
				...(data.userGames as ScoreGame[]),
			])
		}
	}, [moreFetcher.data])

	return (
		<div className='flex flex-col gap-6'>
			<Filters
				filter={loaderData.filter}
				onApply={() => {
					// the same problem as form submission, fetchers does not reset
					// https://github.com/remix-run/remix/discussions/2749
					moreFetcher.reset()
				}}
			/>
			<Gamelist userGames={userGames} />
			{hasMore && (
				<moreFetcher.Form method='GET' className='flex'>
					<input
						type='hidden'
						name='page'
						value={page + 1}
					/>
					<Button
						type='submit'
						className='flex-1 flex gap-2 items-center text-lg'
						variant='ghost'
						disabled={moreFetcher.state === 'loading'}
					>
						{moreFetcher.state === 'loading' && (
							<ShellIcon className='animate-spin' />
						)}
						Mostrar mais
					</Button>
				</moreFetcher.Form>
			)}
		</div>
	)
}

function Gamelist({userGames}: {userGames: ScoreGame[]}) {
	return (
		<TooltipProvider>
			<ul className='grid grid-cols-1 gap-2 list-none sm:grid-cols-2 lg:grid-cols-3 lg:gap-3'>
				{userGames.map(({game, score}) => (
					<li key={game.id}>
						<Card>
							<CardHeader className='flex flex-nowrap'>
								<GameLink game={game} />
							</CardHeader>
							<CardFooter>
								<ScoreDisplay score={score!} />
							</CardFooter>
						</Card>
					</li>
				))}
			</ul>
		</TooltipProvider>
	)
}

function Filters({
	filter,
	onApply,
}: {
	filter: Filter
	onApply: () => void
}) {
	const submit = useSubmit()
	const form = useMemo(
		() => getFilterFromForm(filter),
		[filter],
	)

	return (
		<Form>
			<ToggleGroup
				type='single'
				aria-label='Ordenar por'
				defaultValue={form.get('ob') as string}
				onValueChange={(newValue) => {
					const formData = new FormData()
					formData.set('ob', newValue)
					submit(formData)
					onApply()
				}}
			>
				<ToggleGroupItem value='best'>
					Melhores
				</ToggleGroupItem>
				<ToggleGroupItem value='recent'>
					Recentes
				</ToggleGroupItem>
			</ToggleGroup>
		</Form>
	)
}

interface Filter {
	orderBy: 'updatedAt' | 'value'
}

function getFilterFromSearch(
	searchParams: URLSearchParams,
) {
	const result: Partial<Filter> = {}
	const orderBy = searchParams.get('ob')
	if (orderBy === 'recent') {
		result.orderBy = 'updatedAt'
	} else {
		// orderBy === 'best'
		result.orderBy = 'value'
	}
	return result as Filter
}

function getFilterFromForm(filter: Filter) {
	const result = new FormData()

	if (filter.orderBy) {
		if (filter.orderBy === 'updatedAt') {
			result.set('ob', 'recent')
		} else if (filter.orderBy === 'value') {
			result.set('ob', 'best')
		}
	}
	return result
}
