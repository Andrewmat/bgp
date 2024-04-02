import {XMLParser} from 'fast-xml-parser'
// import he from 'he'
import {
	prefixAttr,
	type BggSchemaBoardgame,
	type BggSchemaSearchResult,
	type BggSchemaPollResultNumPlayers,
	text,
	BggSchemaBoardgameError,
	Rank,
} from './schema'

const xmlParser = new XMLParser({
	ignoreAttributes: false,
	allowBooleanAttributes: true,
	attributeNamePrefix: prefixAttr,
	processEntities: true,
})
xmlParser.addEntity('#034', '"')
xmlParser.addEntity('#039', "'")

export interface BggBoardgame {
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
	mechanics: {id: string; label: string}[]
	bga: {implemented: boolean}
	numPlayerSuggestion: {
		numPlayers: string
		best: string | undefined
		recommended: string | undefined
		notRecommended: string | undefined
	}[]
	stats?: BggBoardgameStats
}
export interface BggBoardgameStats {
	usersRated: number
	average: number
	bayesAverage: number
	stdDev: number
	numWeight: number
	averageWeight: number
	ranks: {
		type: 'subtype' | 'family'
		id: string
		name: string
		friendlyName: string
		value: string
		bayersAverage: string
	}[]
}

export async function getGameId(
	gameId: string,
	stats = false,
): Promise<BggBoardgame> {
	const result = (await fetchBgg(
		`/boardgame/${gameId}`,
		new URLSearchParams({stats: stats ? '1' : '0'}),
	)) as {
		boardgames: {
			boardgame:
				| BggSchemaBoardgame
				| BggSchemaBoardgameError
		}
	}
	if ('error' in result.boardgames.boardgame) {
		const message =
			result.boardgames.boardgame.error._message
		if (message === 'Item not found') {
			throw new Response(message, {status: 404})
		} else {
			throw new Response(message, {status: 500})
		}
	}

	return adaptBoardGame(result.boardgames.boardgame)
}

export async function getGamesListId(gameIds: string[]) {
	const result = (await fetchBgg(
		`/boardgame/${gameIds.join(',')}`,
	)) as {
		boardgames: {
			boardgame: BggSchemaBoardgame | BggSchemaBoardgame[]
		}
	}

	return Array.isArray(result.boardgames.boardgame)
		? result.boardgames.boardgame.map((boardgame) =>
				adaptBoardGame(boardgame),
			)
		: [adaptBoardGame(result.boardgames.boardgame)]
}

export interface BggSearchResult {
	id: string
	name: string
	yearPublished: number
}

export async function searchGames(
	term: string,
	exact = false,
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
					: game.name[text],
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
		`https://api.geekdo.com/xmlapi/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}?${
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

const FAMILY_BGA_ID = '70360'

function adaptBoardGame(
	game: BggSchemaBoardgame,
): BggBoardgame {
	const family =
		game.boardgamefamily == undefined
			? []
			: Array.isArray(game.boardgamefamily)
				? game.boardgamefamily
				: [game.boardgamefamily]
	const hasBGA = family.some(
		(f) => f._objectid === FAMILY_BGA_ID,
	)

	const mechanics =
		typeof game.boardgamemechanic === 'undefined'
			? []
			: Array.isArray(game.boardgamemechanic)
				? game.boardgamemechanic
				: [game.boardgamemechanic]
	const stats = game.statistics?.ratings
		? adaptStats(game.statistics)
		: undefined

	function adaptStats(
		stats: NonNullable<BggSchemaBoardgame['statistics']>,
	): BggBoardgame['stats'] {
		function adaptRank(rank: Rank) {
			return {
				id: rank._id,
				type: rank._type,
				name: rank._name,
				friendlyName: rank._friendlyname,
				value: rank._value,
				bayersAverage: rank._bayersaverage,
			}
		}

		const ranks = Array.isArray(stats.ratings.ranks.rank)
			? stats.ratings.ranks.rank
			: stats.ratings.ranks.rank != null
				? [stats.ratings.ranks.rank]
				: []

		return {
			average: stats.ratings.average,
			averageWeight: stats.ratings.averageweight,
			bayesAverage: stats.ratings.averageweight,
			numWeight: stats.ratings.numweights,
			stdDev: stats.ratings.stddev,
			usersRated: stats.ratings.usersrated,
			ranks: ranks.map((rank) => adaptRank(rank)),
		}
	}
	return {
		id: game._objectid,
		name: String(
			Array.isArray(game.name)
				? game.name.find((p) => p._primary === 'true')?.[
						text
					] ?? game.name[0][text]
				: game.name[text],
		),
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
		mechanics: mechanics.map((m) => ({
			label: m[text],
			id: m._objectid,
		})),
		bga: {implemented: hasBGA},
		stats,
		numPlayerSuggestion: (() => {
			const poll = game.poll.find(
				(p) => p._name === 'suggested_numplayers',
			) as Extract<
				(typeof game.poll)[number],
				{_name: 'suggested_numplayers'}
			>
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!poll) return []
			const pollResults = Array.isArray(poll.results)
				? poll.results
				: [poll.results]
			return adaptNumPlayerPollResults(pollResults)
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
