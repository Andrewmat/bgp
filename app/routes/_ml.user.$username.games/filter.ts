export interface Filter {
	orderBy: 'updatedAt' | 'value'
	numPlayers?: [min: number, max: number]
}

export const MAX_PLAYERS = 12

export function getFilterFromSearch(
	searchParams: URLSearchParams,
) {
	const result: Partial<Filter> = {}
	const orderBy = searchParams.get('ob')
	if (orderBy === 'recent') {
		result.orderBy = 'updatedAt'
	} else {
		// orderBy === 'best'
		result.orderBy = 'value'
	}

	return result as Filter
}

export function getFilterFromForm(filter: Filter) {
	const result = new FormData()

	if (filter.orderBy) {
		if (filter.orderBy === 'updatedAt') {
			result.set('ob', 'recent')
		} else if (filter.orderBy === 'value') {
			result.set('ob', 'best')
		}
	}

	return result
}
