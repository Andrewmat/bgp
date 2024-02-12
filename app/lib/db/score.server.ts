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
	take = 10,
}: {
	userId: string
	skip?: number
	take?: number
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
		orderBy: {updatedAt: 'desc'},
	})
}

export async function getScoresFollowingGame({
	gameId,
	userId,
}: {
	gameId: string
	userId: string
}) {
	return await db.score.findMany({
		where: {
			gameId,
			userId: {
				in:
					(
						await db.follows.findMany({
							where: {followedById: userId},
							select: {followingId: true},
						})
					).map((f) => f.followingId) || [],
			},
		},
		select: {user: true, value: true},
	})
}
