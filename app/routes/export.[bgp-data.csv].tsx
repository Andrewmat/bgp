import type {LoaderFunctionArgs} from '@remix-run/node'
import {json2csv} from 'json-2-csv'
import {getFastGamesListId} from '~/lib/db/gameuser.server'
import {db} from '~/lib/db/singleton.server'
import {assertAuthenticated} from '~/lib/login/auth.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await assertAuthenticated(request)
	const scores = await db.score.findMany({
		where: {userId: user.id},
		select: {
			gameId: true,
			updatedAt: true,
			review: true,
			value: true,
		},
	})

	const scoredGameIds = scores.map((s) => s.gameId)
	const gameList = await getFastGamesListId(scoredGameIds)

	const responseBody = scores.map((s) => {
		const internalGame = gameList.find(
			(g) => s.gameId === g.id,
		)
		return {
			gameBggId: s.gameId,
			gameName: internalGame?.name ?? '-',
			review: s.review,
			score: s.value,
		}
	})
	return new Response(json2csv(responseBody), {
		headers: {
			'Content-Type': 'text/csv',
		},
	})
}
