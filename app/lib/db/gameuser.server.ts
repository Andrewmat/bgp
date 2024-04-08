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
	const games = await getGamesListId(gameIds)
	return games
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
}: {
	userId: string
	skip?: number
	take?: number
}) {
	const [relations, count] = await db.$transaction([
		db.gameUser.findMany({
			where: {userId, bookmarked: true},
			select: {gameId: true},
			skip,
			take,
		}),
		db.gameUser.count({where: {userId, bookmarked: true}}),
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
