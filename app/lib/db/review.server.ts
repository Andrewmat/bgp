import {db} from './singleton.server'

export function getReviewByUserGame({
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
			review: true,
		},
	})
}

export function getReviewsByUser({
	userId,
	take = 12,
	skip = 0,
}: {
	userId: string
	take?: number
	skip?: number
}) {
	return db.score.findMany({
		where: {
			userId,
			AND: [{review: {not: null}}, {review: {not: ''}}],
		},
		take,
		skip,
	})
}

export function getReviewsByGame({
	gameId,
	take = 12,
	skip = 0,
}: {
	gameId: string
	take?: number
	skip?: number
}) {
	return db.score.findMany({
		where: {
			gameId,
			AND: [{review: {not: null}}, {review: {not: ''}}],
		},
		include: {user: true},
		orderBy: {updatedAt: 'desc'},
		take,
		skip,
	})
}

export async function upsertReview({
	userId,
	gameId,
	value,
	review,
}: {
	userId: string
	gameId: string
	value: number
	review: string
}) {
	return db.score.upsert({
		where: {userId_gameId: {userId, gameId}},
		create: {userId, gameId, value, review},
		update: {value, review},
	})
}
