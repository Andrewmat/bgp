import {LoaderFunctionArgs, json} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {
	Card,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {getGameId} from '~/lib/bgg'
import {getScoresByUser} from '~/lib/db/score.server'
import {getUserByUsername} from '~/lib/db/user.server'
import {EvaluationForm} from '~/components/EvaluationForm'

export async function loader({
	params,
	request,
}: LoaderFunctionArgs) {
	invariant(params.username, 'Username is required')
	const user = await getUserByUsername(params.username)
	if (!user) {
		throw new Response('Not found', {status: 404})
	}

	const searchParams = new URL(request.url).searchParams

	const scorePage =
		Number(searchParams.get('score_page')) || 1
	const scorePageSize =
		Number(searchParams.get('score_page_size')) || 10
	const rawScores = await getScoresByUser({
		userId: user.id,
		skip: (scorePage - 1) * scorePageSize,
		take: scorePageSize,
	})
	const games = await Promise.all(
		rawScores.map((score) => getGameId(score.gameId)),
	)
	return json({
		scores: rawScores.map((s) => ({
			score: s.value,
			game: games.find((g) => g.id === s.gameId)!,
		})),
	})
}

export default function UserScores() {
	const {scores} = useLoaderData<typeof loader>()
	return (
		<div>
			<div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3'>
				{scores.map((s) => (
					<li key={s.game.id} className='list-none'>
						<Card>
							<CardHeader>
								<CardTitle>
									<Link to={`/game/${s.game.id}`}>
										{s.game.name}
									</Link>
								</CardTitle>
							</CardHeader>
							<CardFooter>
								<EvaluationForm
									gameId={s.game.id}
									score={s.score}
								/>
							</CardFooter>
						</Card>
					</li>
				))}
			</div>
		</div>
	)
}
