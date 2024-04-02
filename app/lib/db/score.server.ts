import {BggBoardgame, getGamesListId} from '../bgg'
import {getFollowing} from './follow.server'
import {db} from './singleton.server'

export async function upsertScore({
	userId,
	gameId,
	value,
}: {
	userId: string
	gameId: string
	value: number
}) {
	return db.score.upsert({
		where: {userId_gameId: {userId, gameId}},
		create: {userId, gameId, value},
		update: {value},
	})
}

export function deleteScore({id}: {id: string}) {
	return db.score.deleteMany({
		where: {id},
	})
}

export function getScoreByUserGame({
	userId,
	gameId,
}: {
	userId: string
	gameId: string
}) {
	return db.score.findFirst({
		where: {userId, gameId},
		select: {
			id: true,
			userId: true,
			gameId: true,
			value: true,
			updatedAt: true,
		},
	})
}

export function getScoresByUser({
	userId,
	skip = 0,
	take = 12,
	orderBy = 'value',
}: {
	userId: string
	skip?: number
	take?: number
	orderBy?: 'value' | 'updatedAt'
}) {
	return db.score.findMany({
		where: {userId},
		select: {
			gameId: true,
			value: true,
			updatedAt: true,
		},
		skip,
		take,
		orderBy: {[orderBy]: 'desc'},
	})
}

export function getScoresSearch({
	userId,
	gameIds,
	skip = 0,
	take = 12,
}: {
	userId: string
	gameIds: string[]
	skip?: number
	take?: number
}) {
	return db.score.findMany({
		where: {userId, gameId: {in: gameIds}},
		select: {
			gameId: true,
			value: true,
			updatedAt: true,
		},
		skip,
		take,
		orderBy: {value: 'desc'},
	})
}

export async function getScoresGroup({
	gameId,
	userIds,
}: {
	gameId: string
	userIds: string[]
}) {
	return await db.score.findMany({
		where: {gameId, userId: {in: userIds}},
		select: {
			user: {
				select: {id: true, name: true, username: true},
			},
			value: true,
		},
		take: 12,
		orderBy: {value: 'desc'},
	})
}

export async function getRecommendedToRate({
	userId,
	skip = 0,
	take = 12,
}: {
	userId: string
	skip?: number
	take?: number
}) {
	const following = await getFollowing({
		followedById: userId,
	})

	const skippedGames = await Promise.all([
		db.score.findMany({
			where: {userId},
			select: {gameId: true},
		}),
		db.gameUser.findMany({
			where: {userId, ignored: true},
			select: {gameId: true},
		}),
	]).then(([alreadyVoted, ignored]) =>
		removeDuplicates([
			...alreadyVoted.map(selectGameId),
			...ignored.map(selectGameId),
		]),
	)

	let gameIds = (
		await db.score.groupBy({
			by: 'gameId',
			skip,
			take,
			where: {userId: {in: following.map((f) => f.id)}},
			orderBy: {_avg: {value: 'desc'}},
			having: {
				gameId: {notIn: skippedGames},
			},
		})
	).map(selectGameId)

	if (gameIds.length === 0) {
		gameIds = (
			await db.score.groupBy({
				by: 'gameId',
				skip,
				take,
				orderBy: {_avg: {value: 'desc'}},
				having: {
					gameId: {notIn: skippedGames},
				},
			})
		).map(selectGameId)

		if (gameIds.length === 0) {
			return []
		}
	}

	const games = await getGamesListId(gameIds)

	return games.map((game) => ({
		score: undefined,
		game,
	}))
}

function removeDuplicates<T>(arr: T[]) {
	return Array.from(new Set(arr))
}

export interface ScoreTableGame {
	game: BggBoardgame
	avgValue: number | null
	table: {
		user: {
			id: string
			name: string
			username: string
		}
		score: number
	}[]
}

export async function getScoresTable({
	table,
	take = 12,
	skip = 0,
}: {
	table: string[]
	take?: number
	skip?: number
}): Promise<ScoreTableGame[]> {
	const resultScores = await db.score.groupBy({
		by: ['gameId'],
		where: {userId: {in: table}},
		_avg: {value: true},
		orderBy: [
			{_avg: {value: 'desc'}},
			{_count: {userId: 'desc'}},
		],
		take,
		skip,
	})
	if (resultScores.length === 0) {
		return []
	}
	const gameIds = resultScores.map(selectGameId)
	const resultGames = await getGamesListId(gameIds)
	const resultUsers = await db.score.findMany({
		where: {
			gameId: {in: gameIds},
			userId: {in: table},
		},
		select: {
			gameId: true,
			user: {
				select: {id: true, name: true, username: true},
			},
			value: true,
		},
	})

	return resultScores.map((group) => ({
		game: resultGames.find((g) => g.id === group.gameId)!,
		avgValue: group._avg.value,
		table: resultUsers
			.filter((u) => u.gameId === group.gameId)
			.map((u) => ({
				user: u.user,
				score: u.value,
			})),
	}))
}

const selectGameId = (v: {gameId: string}) => v.gameId
