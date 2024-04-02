import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {BggBoardgame} from '~/lib/bgg'
import {getFollowing} from '~/lib/db/follow.server'
import {
	ScoreTableGame,
	getScoresTable,
} from '~/lib/db/score.server'
import {getUsers} from '~/lib/db/user.server'
import {assertAuthenticated} from '~/lib/login/auth.server'
import {
	getOnSession,
	setOnSession,
	unsetOnSession,
} from '~/lib/login/session.server'
import {GameCard} from './GameCard'
import {TableManager} from '../../components/FormTableManager'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import Pagination from '~/components/Pagination'
import {Separator} from '~/components/ui/separator'

const PAGE_SIZE = 12

export const loader = async ({
	request,
}: LoaderFunctionArgs) => {
	const user = await assertAuthenticated(request)
	const pageParam = new URL(request.url).searchParams.get(
		'page',
	)
	const page = Number(pageParam) || 1
	const following = await getFollowing({
		followedById: user.id,
	})
	const table = await getOnSession(request, 'table')
	let tableScores: ScoreTableGame[] | null = null
	if (table) {
		tableScores = await getScoresTable({
			table: table.map((t) => t.id),
			skip: (page - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
		})
	}
	return {table, following, tableScores, page, user}
}

export async function action({
	request,
}: ActionFunctionArgs) {
	const formData = await request.formData()
	switch (formData.get('intent')) {
		case 'post': {
			const userIds = formData.getAll('user-id') as string[]
			const users = await getUsers(userIds)

			const commitSession = await setOnSession(
				request,
				'table',
				users,
			)
			return json(null, {
				headers: {'Set-Cookie': await commitSession()},
			})
		}
		case 'delete': {
			const commitSession = await unsetOnSession(
				request,
				'table',
			)
			return json(null, {
				headers: {'Set-Cookie': await commitSession()},
			})
		}
	}
}

export default function TablePage() {
	const {following, user, table, tableScores, page} =
		useLoaderData<typeof loader>()

	return (
		<Card>
			<CardHeader>
				<CardTitle>Mesa</CardTitle>
			</CardHeader>
			<CardContent className='flex flex-col gap-2'>
				<TableManager
					user={user}
					group={following}
					table={table ?? []}
				/>

				{table && (
					<>
						<Separator className='my-4' />
						<div className='grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
							{tableScores?.map((s) => (
								<div key={s.game.id}>
									<GameCard
										game={s.game as BggBoardgame}
										tableScore={s.table}
										table={table}
										sessionUserId={user.id}
									/>
								</div>
							))}
						</div>
						<Pagination
							hasNext={tableScores?.length === PAGE_SIZE}
							page={page}
							searchParam='page'
						/>
					</>
				)}
			</CardContent>
		</Card>
	)
}
