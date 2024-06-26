import {BggGame, Prisma} from '@prisma/client'
import {
	BggBoardgame,
	BggSearchResult,
	searchGames as bggSearchGames,
} from '../bgg'
import {db} from './singleton.server'

export async function upsertBggGames(
	games: BggBoardgame[],
) {
	const insertedIds = (
		await db.bggGame.findMany({
			where: {externalId: {in: games.map((g) => g.id)}},
			select: {externalId: true},
		})
	).map((g) => g.externalId)
	const newGames = games.filter(
		(g) => !insertedIds.includes(g.id),
	)
	// https://github.com/prisma/prisma/issues/9562
	return Promise.all(
		newGames.map((game) =>
			db.bggGame.upsert({
				where: {externalId: game.id},
				create: {
					externalId: game.id,
					name: game.name,
					image: game.image,
					thumbnail: game.thumbnail,
					maxPlayers: game.maxPlayers,
					minPlayers: game.minPlayers,
				},
				update: {},
			}),
		),
	)
}

export async function searchGames(searchTerm?: string) {
	const where = searchTerm
		? ({
				OR: [
					{name: {contains: searchTerm}},
					{id: searchTerm},
					{externalId: searchTerm},
				],
			} satisfies Prisma.BggGameWhereInput)
		: undefined

	return db.bggGame.findMany({
		where,
	})
}

export interface GameSearchResultEnhanced
	extends BggSearchResult {
	thumbnail?: BggGame['thumbnail']
}

export async function searchExternalGames(
	searchTerm: string,
	exact = false,
): Promise<GameSearchResultEnhanced[]> {
	const result = await bggSearchGames(searchTerm, exact)
	const gameIds = result.map((r) => r.id)
	const internalGames = await db.bggGame.findMany({
		where: {
			externalId: {in: gameIds},
		},
	})
	return result.map((r) => ({
		...r,
		thumbnail: internalGames.find(
			(ig) => ig.externalId === r.id,
		)?.thumbnail,
	}))
}
