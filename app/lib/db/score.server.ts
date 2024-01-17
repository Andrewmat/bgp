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
}: {
	userId: string
}) {
	return db.score.findMany({
		where: {userId},
		select: {
			gameId: true,
			value: true,
			updatedAt: true,
		},
		orderBy: {updatedAt: 'desc'},
	})
}
