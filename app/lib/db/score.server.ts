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
	})
}

export function getScores({
	userEmail,
}: {
	userEmail: string
}) {
	return db.score.findMany({
		where: {userEmail},
	})
}
