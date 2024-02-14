import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import {Form, Link, useLoaderData} from '@remix-run/react'
import {useId, useMemo} from 'react'
import {Button} from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {Checkbox} from '~/components/ui/checkbox'
import {Label} from '~/components/ui/label'
import {BggBoardgame} from '~/lib/bgg'
import {getFollowing} from '~/lib/db/follow.server'
import {
	ScoreTableGame,
	getScoresTable,
} from '~/lib/db/score.server'
import {getUsers} from '~/lib/db/user.server'
import {assertAuthenticated} from '~/lib/login/auth.server'
import {
	SessionTable,
	getOnSession,
	setOnSession,
	unsetOnSession,
} from '~/lib/login/session.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await assertAuthenticated(request)
	const following = await getFollowing({
		followedById: user.id,
	})
	const table = await getOnSession(request, 'table')
	let tableScores: ScoreTableGame[] | null = null
	if (table) {
		tableScores = await getScoresTable({
			table: table.map((t) => t.id),
		})
	}
	return json({table, following, tableScores})
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
	const {following, table, tableScores} =
		useLoaderData<typeof loader>()
	const id = useId()
	return (
		<>
			<Form method='POST'>
				<input type='hidden' name='intent' value='post' />
				{following.map((follow) => (
					<div key={follow.id}>
						<Checkbox
							name='user-id'
							value={follow.id}
							id={`${id}-follow-${follow.id}`}
							defaultChecked={table?.some(
								(tUser) => tUser.id === follow.id,
							)}
						/>
						<Label htmlFor={`${id}-follow-${follow.id}`}>
							{follow.name}{' '}
							<small>
								<Link to={`/user/${follow.username}`}>
									(@{follow.username})
								</Link>
							</small>
						</Label>
					</div>
				))}
				<Button type='submit'>Criar mesa</Button>
			</Form>
			{table && (
				<>
					<h1>Scores</h1>
					{tableScores?.map((s) => (
						<CardGameTable
							key={s.game.id}
							avgValue={s.avgValue}
							game={s.game as BggBoardgame}
							tableScore={s.table}
							table={table}
						/>
					))}
					<Form method='DELETE'>
						<input
							type='hidden'
							name='intent'
							value='delete'
						/>
						<Button type='submit'>Remover mesa</Button>
					</Form>
				</>
			)}
		</>
	)
}

function CardGameTable({
	game,
	avgValue,
	tableScore,
	table,
}: {
	game: ScoreTableGame['game']
	avgValue: ScoreTableGame['avgValue']
	tableScore: ScoreTableGame['table']
	table: SessionTable
}) {
	const missing = useMemo(
		() =>
			table.filter(
				(t) =>
					!tableScore.some((ts) => ts.user.id === t.id),
			),
		[table, tableScore],
	)
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{game.name}: <em>{avgValue}</em>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<table>
					<thead>
						<tr>
							<th>User</th>
							<th>Score</th>
						</tr>
					</thead>
					<tbody>
						{tableScore.map((ts) => (
							<tr key={ts.user.id}>
								<td>
									{ts.user.name}
									<br />
									<Link to={`/user/${ts.user.username}`}>
										(@{ts.user.username})
									</Link>
								</td>
								<td>{ts.score}</td>
							</tr>
						))}
					</tbody>
				</table>
			</CardContent>
			<CardFooter>
				{missing.length > 0 && (
					<>
						Missing: {missing.map((t) => t.name).join(', ')}
					</>
				)}
			</CardFooter>
		</Card>
	)
}
