import type {LoaderFunctionArgs} from '@remix-run/node'
import {getGamesListId} from '~/lib/bgg'
import {db} from '~/lib/db/singleton.server'
import {json2csv} from 'json-2-csv'
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
	const internalGames = await db.bggGame.findMany({
		where: {
			externalId: {in: scoredGameIds},
		},
		select: {
			externalId: true,
			name: true,
		},
	})
	const missingIds = (() => {
		const tmpMissingIds = [...scoredGameIds]
		internalGames.forEach((g) => {
			const ind = tmpMissingIds.indexOf(g.externalId)
			tmpMissingIds.splice(ind, 1)
		})
		return tmpMissingIds
	})()

	const bggGames = await getGamesListId(missingIds)

	const responseBody = scores.map((s) => {
		const internalGame = internalGames.find(
			(g) => s.gameId === g.externalId,
		)
		let name = internalGame?.name
		if (!internalGame) {
			const externalGame = bggGames.find(
				(g) => s.gameId === g.id,
			)
			name = externalGame?.name
		}
		return {
			gameBggId: s.gameId,
			gameName: name ?? '-',
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
