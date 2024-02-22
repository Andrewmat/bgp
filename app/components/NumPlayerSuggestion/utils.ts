import {BggBoardgame} from '~/lib/bgg'

export type TSuggestion =
	BggBoardgame['numPlayerSuggestion'][number]

export function suggestionByNumPlayers(
	suggestion: BggBoardgame['numPlayerSuggestion'][number],
	numPlayers: number,
) {
	let suggestionPlayers = Number(suggestion.numPlayers)
	if (!Number.isNaN(suggestionPlayers)) {
		// number parsed successfully
		return suggestionPlayers === numPlayers
	}

	// number stripping all NaN
	suggestionPlayers = Number(
		suggestion.numPlayers
			.split('')
			.filter((c) => !isNaN(Number(c)))
			.join(''),
	)
	if (
		suggestion.numPlayers.includes('+') &&
		suggestionPlayers < numPlayers
	) {
		return true
	}
	if (
		suggestion.numPlayers.includes('-') &&
		suggestionPlayers > numPlayers
	) {
		return true
	}
	return false
}

export function getPercentages(
	suggestion: TSuggestion,
): Omit<Record<keyof TSuggestion, number>, 'numPlayers'> {
	const safeNumber = (num: string | undefined) =>
		Number(num) || 0
	const best = safeNumber(suggestion.best)
	const recommended = safeNumber(suggestion.recommended)
	const notRecommended = safeNumber(
		suggestion.notRecommended,
	)
	const total = best + recommended + notRecommended
	if (total === 0) {
		return {
			best: 0,
			recommended: 0,
			notRecommended: 0,
		}
	}
	return {
		best: best / total,
		recommended: recommended / total,
		notRecommended: notRecommended / total,
	}
}

export const percentFormatter = new Intl.NumberFormat(
	'pt-BR',
	{
		style: 'percent',
	},
)
