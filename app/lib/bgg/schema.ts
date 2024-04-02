export const text = '#text'
export const prefixAttr = '_'
type PrefixAttr = typeof prefixAttr

const attr = <T extends string>(
	name: T,
): `${PrefixAttr}${typeof name}` => `${prefixAttr}${name}`

const objectid = attr('objectid')
const primary = attr('primary')
const sortindex = attr('sortindex')
const title = attr('title')
const totalvotes = attr('totalvotes')
const name = attr('name')
const value = attr('value')
const numvotes = attr('numvotes')
const numplayers = attr('numplayers')
const level = attr('level')
const message = attr('message')
const type = attr('type')
const id = attr('id')
const friendlyname = attr('friendlyname')
const bayersaverage = attr('bayersaverage')

export interface BggSchemaBoardgame {
	[objectid]: string
	name: BoardgameName | BoardgameName[]
	yearpublished: number
	minplayers: number
	maxplayers: number
	playingtime: number
	minplaytime: number
	maxplaytime: number
	age: number
	description: string
	thumbnail: string
	image: string
	boardgamehonor: SimpleObject
	boardgamepublisher: SimpleObject
	boardgamepodcastepisode: SimpleObject
	boardgamesubdomain: SimpleObject
	boardgamecategory: SimpleObject
	boardgameaccessory: SimpleObject
	boardgameexpansion: SimpleObject
	boardgameimplementation: SimpleObject
	boardgameversion: SimpleObject
	boardgamefamily: SimpleObject
	boardgamemechanic: SimpleObject
	boardgameartist: SimpleObject
	boardgamedesigner: SimpleObject
	videogamebg: SimpleObject
	poll: Poll[]
	statistics?: Statistics
}

export interface BggSchemaBoardgameError {
	error: {[message]: string}
}

export interface BggSchemaSearchResult {
	name:
		| string
		| {
				[text]: string
				[primary]: boolean
		  }
	yearpublished: number
	[objectid]: string
}

interface SimpleObjectUnit {
	[text]: string
	[objectid]: string
}
type SimpleObject = SimpleObjectUnit | SimpleObjectUnit[]

interface BoardgameName {
	[text]: string
	[primary]?: 'true' | 'false'
	[sortindex]: string
}

type Poll = {
	[title]: string
	[totalvotes]: string
} & (
	| {
			[name]: 'suggested_numplayers'
			results:
				| BggSchemaPollResultNumPlayers
				| BggSchemaPollResultNumPlayers[]
	  }
	| {
			[name]: 'language_dependence'
			results: BggSchemaPollResultLng
	  }
	| {
			[name]: 'suggested_playerage'
			results: BggSchemaPollResultAge
	  }
)

export interface Rank {
	[type]: 'subtype' | 'family'
	[id]: string
	[name]: string
	[friendlyname]: string
	[value]: string
	[bayersaverage]: string
}

interface Statistics {
	ratings: {
		usersrated: number
		average: number
		bayersaverage: number
		stddev: number
		median: number
		owned: number
		trading: number
		wanting: number
		wishing: number
		numcomments: number
		numweights: number
		averageweight: number
		ranks: {
			rank?: Rank | Rank[]
		}
	}
}

export interface BggSchemaPollResultNumPlayers {
	result: {
		[value]: 'Best' | 'Recommended' | 'Not Recommended'
		[numvotes]: string
	}[]
	[numplayers]: string
}

export interface BggSchemaPollResultLng {
	result: {
		[level]: string
		[value]: string
		[numvotes]: string
	}[]
}
export interface BggSchemaPollResultAge {
	result: {
		[value]: string
		[numvotes]: string
	}[]
}
