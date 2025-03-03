import {Prisma} from '@prisma/client'
import {getGamesListId} from '../bgg'
import {db} from './singleton.server'

interface GameUser {
	userId: string
	gameId: string
}

export function getGameUser({userId, gameId}: GameUser) {
	return db.gameUser.findUnique({
		where: {userId_gameId: {gameId, userId}},
	})
}
export function ignore({userId, gameId}: GameUser) {
	return upsertGameRelation({userId, gameId, ignored: true})
}
export function unignore({userId, gameId}: GameUser) {
	return upsertGameRelation({
		userId,
		gameId,
		ignored: false,
	})
}
export async function getIsIgnored({
	userId,
	gameId,
}: GameUser) {
	const relation = await db.gameUser.findUnique({
		where: {userId_gameId: {gameId, userId}},
	})
	return relation?.ignored ?? false
}

export async function getAllIgnoredGames({
	userId,
}: {
	userId: string
}) {
	const relations = await db.gameUser.findMany({
		where: {userId, ignored: true},
		select: {gameId: true},
	})
	const gameIds = relations.map((r) => r.gameId)
	if (gameIds.length === 0) {
		return []
	}
	const games = await getFastGamesListId(gameIds)
	return games
}

export async function getFastGamesListId(
	gameIds: string[],
) {
	console.log(
		`getFastGamesListId length: ${gameIds.length}`,
	)
	const internalGames = await db.bggGame.findMany({
		where: {
			externalId: {in: gameIds},
		},
		select: {
			externalId: true,
			name: true,
		},
	})
	const missingIds = (() => {
		const tmpMissingIds = [...gameIds]
		internalGames.forEach((g) => {
			const ind = tmpMissingIds.indexOf(g.externalId)
			tmpMissingIds.splice(ind, 1)
		})
		return tmpMissingIds
	})()
	console.log(
		`missingIds(${missingIds.length}): ${missingIds.join(',')}`,
	)
	const bggGames = await getGamesListId(missingIds)

	return gameIds.map((gameId) => {
		const internalGame = internalGames.find(
			(g) => gameId === g.externalId,
		)
		let name = internalGame?.name
		if (!internalGame) {
			const externalGame = bggGames.find(
				(g) => gameId === g.id,
			)
			name = externalGame?.name
		}
		return {
			id: gameId,
			name: name ?? '-',
		}
	})
}

export function bookmark({userId, gameId}: GameUser) {
	return upsertGameRelation({
		userId,
		gameId,
		bookmarked: true,
	})
}
export function unbookmark({userId, gameId}: GameUser) {
	return upsertGameRelation({
		userId,
		gameId,
		bookmarked: false,
	})
}
export async function getIsBookmarked({
	userId,
	gameId,
}: {
	userId: string
	gameId: string
}) {
	const relation = await db.gameUser.findUnique({
		where: {userId_gameId: {gameId, userId}},
	})
	return relation?.bookmarked ?? false
}

export async function getAllBookmarkedGames({
	userId,
	skip,
	take,
	numPlayers,
}: {
	userId: string
	skip?: number
	take?: number
	numPlayers?: number
}) {
	const where: Prisma.GameUserWhereInput = {
		userId,
		game: numPlayers
			? {
					minPlayers: {lte: numPlayers},
					maxPlayers: {gte: numPlayers},
				}
			: undefined,
	}
	const [relations, count] = await db.$transaction([
		db.gameUser.findMany({
			where,
			select: {gameId: true},
			skip,
			take,
		}),
		db.gameUser.count({where}),
	])
	const gameIds = relations.map((r) => r.gameId)
	if (gameIds.length === 0) {
		return {result: [], count}
	}
	return {result: gameIds, count}
}

export function upsertGameRelation({
	userId,
	gameId,
	ignored,
	bookmarked,
}: GameUser & {
	ignored?: boolean
	bookmarked?: boolean
}) {
	return db.gameUser.upsert({
		create: {
			userId,
			gameId,
			ignored: ignored ?? false,
			bookmarked: bookmarked ?? false,
		},
		update: {ignored, bookmarked},
		where: {userId_gameId: {gameId, userId}},
	})
}
