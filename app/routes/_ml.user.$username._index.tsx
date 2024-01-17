import {LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {getGameId} from '~/lib/bgg'
import {getScoresByUser} from '~/lib/db/score.server'
import {getUserByUsername} from '~/lib/db/user.server'

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
			<ul>
				{scores.map((s) => (
					<li key={s.game.id}>
						<strong>{s.game.name}:</strong>
						<em>{s.score}</em>
					</li>
				))}
			</ul>
		</div>
	)
}
