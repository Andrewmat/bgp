import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import {Form, useLoaderData} from '@remix-run/react'
import {Button} from '~/components/ui/button'
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
import {withUser} from '~/lib/remix/wrapUser'
import {Trash2Icon} from 'lucide-react'
import {FormTableManager} from '../../components/FormTableManager'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'

export const loader = withUser(
	async ({request}: LoaderFunctionArgs) => {
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
		return {table, following, tableScores}
	},
)

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
	const {following, user, table, tableScores} =
		useLoaderData<typeof loader>()
	return (
		<div className='flex flex-col gap-6 px-2'>
			<Card>
				<CardHeader>
					<CardTitle>Mesa</CardTitle>
				</CardHeader>
				<CardContent>
					{user && (
						<FormTableManager
							user={user}
							following={following}
							table={table ?? []}
						/>
					)}
				</CardContent>
			</Card>
			{table && (
				<div className='flex flex-col gap-6'>
					<Form method='DELETE'>
						<input
							type='hidden'
							name='intent'
							value='delete'
						/>
						<Button
							type='submit'
							className='flex items-center gap-2'
						>
							<Trash2Icon size='1em' />{' '}
							<span>Deletar mesa</span>
						</Button>
					</Form>
					<div className='grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
						{tableScores?.map((s) => (
							<div key={s.game.id}>
								<GameCard
									avgValue={s.avgValue}
									game={s.game as BggBoardgame}
									tableScore={s.table}
									table={table}
									sessionUserId={user?.id ?? null}
								/>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
