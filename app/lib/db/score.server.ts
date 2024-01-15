import {db} from './singleton.server'

export function upsertScore({
	userEmail,
	gameId,
	value,
}: {
	userEmail: string
	gameId: string
	value: number
}) {
	return db.score.upsert({
		where: {
			userEmail_gameId: {gameId, userEmail},
		},
		update: {value},
		create: {userEmail, gameId, value},
	})
}

export function deleteScore({
	userEmail,
	gameId,
}: {
	userEmail: string
	gameId: string
}) {
	return db.score.delete({
		where: {
			userEmail_gameId: {
				userEmail,
				gameId,
			},
		},
	})
}

export function getScore({
	userEmail,
	gameId,
}: {
	userEmail: string
	gameId: string
}) {
	return db.score.findUnique({
		where: {
			userEmail_gameId: {
				gameId,
				userEmail,
			},
		},
		select: {
			userEmail: true,
			gameId: true,
			value: true,
			updatedAt: true,
		},
	})
}

export function getScores({
	userEmail,
}: {
	userEmail: string
}) {
	return db.score.findMany({
		where: {userEmail},
		select: {
			gameId: true,
			value: true,
			updatedAt: true,
		},
		orderBy: {updatedAt: 'desc'},
	})
}
