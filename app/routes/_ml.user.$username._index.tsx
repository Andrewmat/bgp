import {LoaderFunctionArgs, json} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {getGameId} from '~/lib/bgg'
import {getScoresByUser} from '~/lib/db/score.server'
import {getUserByUsername} from '~/lib/db/user.server'
import {ScoreList} from '~/components/ScoreList'
import {ScoreGame} from '~/lib/db/score.type'
import {Button} from '~/components/ui/button'
import {CardTitle} from '~/components/ui/card'

const pageSize = 6

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
	const orderByParam = searchParams.get('order_by')

	const {result: rawScores} = await getScoresByUser({
		userId: user.id,
		skip: (scorePage - 1) * pageSize,
		take: pageSize,
		orderBy:
			orderByParam === 'updatedAt' ? 'updatedAt' : 'value',
	})
	const games = await Promise.all(
		rawScores.map((score) => getGameId(score.gameId)),
	)
	return json({
		username: params.username,
		scorePage,
		scores: rawScores.map((s) => ({
			score: s.value,
			game: games.find((g) => g.id === s.gameId)!,
		})),
	})
}

export default function UserScores() {
	const {scores, scorePage, username} =
		useLoaderData<typeof loader>()
	return (
		<div>
			<Button asChild variant='link' className='text-lg'>
				<Link to={`/user/${username}/games`}>
					<CardTitle>Jogos votados</CardTitle>
				</Link>
			</Button>
			<ScoreList
				page={scorePage}
				scores={scores as ScoreGame[]}
				noPagination
			/>
		</div>
	)
}
