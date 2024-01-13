import {db} from './singleton.server'

export async function upsertReview({
	userEmail,
	gameId,
	content,
}: {
	userEmail: string
	gameId: string
	content: string
}) {
	return db.review.upsert({
		where: {
			userEmail_gameId: {gameId, userEmail},
		},
		update: {content},
		create: {userEmail, gameId, content},
	})
}

export function getReview({
	userEmail,
	gameId,
}: {
	userEmail: string
	gameId: string
}) {
	return db.review.findUnique({
		where: {
			userEmail_gameId: {userEmail, gameId},
		},
	})
}

export function getReviews({
	userEmail,
}: {
	userEmail: string
}) {
	return db.review.findMany({
		where: {userEmail},
	})
}
