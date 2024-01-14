import {XMLParser} from 'fast-xml-parser'
import {
	prefixAttr,
	type BggSchemaBoardgame,
	type BggSchemaSearchResult,
	type BggSchemaPollResultNumPlayers,
} from './schema'

const xmlParser = new XMLParser({
	ignoreAttributes: false,
	allowBooleanAttributes: true,
	attributeNamePrefix: prefixAttr,
	processEntities: true,
})

export type BggBoardgame = {
	id: string
	name: string
	description: string
	minPlayers: number
	maxPlayers: number
	yearPublished: number
	playingTime: number
	minPlayTime: number
	maxPlayTime: number
	age: number
	image: string
	thumbnail: string
	numPlayerSuggestion: {
		numPlayers: string
		best: string | undefined
		recommended: string | undefined
		notRecommended: string | undefined
	}[]
}

export async function getGameId(
	gameId: string,
): Promise<BggBoardgame> {
	const result = (await fetchBgg(
		`/boardgame/${gameId}`,
	)) as {
		boardgames: {
			boardgame: BggSchemaBoardgame
		}
	}

	return adaptBoardGame(result.boardgames.boardgame)
}

export async function getGamesListId(gameIds: string[]) {
	const result = (await fetchBgg(
		`/boardgame/${gameIds.join(',')}`,
	)) as {
		boardgames: {
			boardgame: BggSchemaBoardgame[]
		}
	}
	return result.boardgames.boardgame.map((boardgame) =>
		adaptBoardGame(boardgame),
	)
}

export type BggSearchResult = {
	id: string
	name: string
	yearPublished: number
}

export async function searchGames(
	term: string,
	exact: boolean = false,
): Promise<BggSearchResult[]> {
	if (term.length < 3) {
		throw new Error('Term should have 3 or more characters')
	}
	const params = new URLSearchParams()
	params.set('search', term)
	params.set('exact', exact ? '1' : '0')

	const searchResult = (await fetchBgg(
		'/search',
		params,
	)) as {
		boardgames: {
			boardgame?:
				| BggSchemaSearchResult
				| BggSchemaSearchResult[]
		}
	}
	function adapt(game: BggSchemaSearchResult) {
		return {
			id: game._objectid,
			name:
				typeof game.name === 'string'
					? game.name
					: game.name['#text'],
			yearPublished: game.yearpublished,
		}
	}

	if (!searchResult.boardgames.boardgame) {
		return []
	}
	if (Array.isArray(searchResult.boardgames.boardgame)) {
		return searchResult.boardgames.boardgame.map(adapt)
	}
	return [adapt(searchResult.boardgames.boardgame)]
}

async function fetchBgg(
	endpoint: string,
	searchParams?: URLSearchParams,
) {
	const response = await fetch(
		`https://api.geekdo.com/xmlapi/${endpoint}?${
			searchParams ?? ''
		}`,
	)
	if (!response.ok) {
		throw response
	}
	const xml = await response.text()
	const parsed = xmlParser.parse(xml) as unknown
	return parsed
}

function adaptBoardGame(
	game: BggSchemaBoardgame,
): BggBoardgame {
	return {
		id: game._objectid,
		name: Array.isArray(game.name)
			? game.name.find((p) => p._primary === 'true')?.[
					'#text'
				] ?? game.name[0]['#text']
			: game.name['#text'],
		description: game.description,
		minPlayers: game.minplayers,
		maxPlayers: game.maxplayers,
		yearPublished: game.yearpublished,
		playingTime: game.playingtime,
		minPlayTime: game.minplaytime,
		maxPlayTime: game.maxplaytime,
		age: game.age,
		image: game.image,
		thumbnail: game.thumbnail,
		numPlayerSuggestion: (() => {
			const poll = game.poll.find(
				(p) => p._name === 'suggested_numplayers',
			) as Extract<
				(typeof game.poll)[number],
				{_name: 'suggested_numplayers'}
			>
			if (!poll) return []
			return adaptNumPlayerPollResults(poll.results)
		})(),
	}
}
function adaptNumPlayerPollResults(
	results: BggSchemaPollResultNumPlayers[],
) {
	return results
		.filter((result) => Boolean(result._numplayers))
		.map(({result: results, _numplayers: numPlayers}) => ({
			numPlayers: numPlayers,
			best: results.find((r) => r._value === 'Best')
				?._numvotes,
			recommended: results.find(
				(r) => r._value === 'Recommended',
			)?._numvotes,
			notRecommended: results.find(
				(r) => r._value === 'Not Recommended',
			)?._numvotes,
		}))
}
