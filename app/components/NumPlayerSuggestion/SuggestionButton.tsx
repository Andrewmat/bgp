import {
	HeartIcon,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from 'lucide-react'
import {Button, buttonVariants} from '../ui/button'
import {
	TSuggestion,
	getPercentages,
	percentFormatter,
} from './utils'

export function SuggestionButton({
	pickedSuggestion,
}: {
	pickedSuggestion: TSuggestion
}) {
	const pickedPercent = getPercentages(pickedSuggestion)

	return (
		<span
			className={buttonVariants({
				variant: 'ghost',
				className: 'inline-flex items-center gap-3',
			})}
		>
			<span className='inline-flex items-center gap-1'>
				<HeartIcon size='1em' />
				{percentFormatter.format(pickedPercent.best)}
			</span>
			<span className='inline-flex items-center gap-1'>
				<ThumbsUpIcon size='1em' />
				{percentFormatter.format(pickedPercent.recommended)}
			</span>
			<span className='inline-flex items-center gap-1'>
				<ThumbsDownIcon size='1em' />
				{percentFormatter.format(
					pickedPercent.notRecommended,
				)}
			</span>
		</span>
	)
}

export function DefaultSuggestionButton({
	suggestions,
}: {
	suggestions: TSuggestion[]
}) {
	const bestSugs = suggestions
		.filter((s) => {
			const best = Number(s.best) || 0
			const recommended = Number(s.recommended) || 0
			const notRecommended = Number(s.notRecommended) || 0
			return best >= recommended && best > notRecommended
		})
		.map((s) => s.numPlayers)
	const recommendedSugs = suggestions
		.filter((s) => {
			const best = Number(s.best) || 0
			const recommended = Number(s.recommended) || 0
			const notRecommended = Number(s.notRecommended) || 0
			return best + recommended >= notRecommended
		})
		.map((s) => s.numPlayers)

	return (
		<Button
			variant='link'
			className='inline-flex flex-col justify-center gap-2'
		>
			<span className='inline-flex items-center gap-2'>
				<ThumbsUpIcon size='1em' /> {bestSugs?.at(0)}{' '}
				&mdash; {recommendedSugs?.at(-1)} jogadores
			</span>
			<span className='inline-flex items-center gap-2'>
				<HeartIcon size='1em' /> {recommendedSugs?.at(0)}{' '}
				&mdash; {recommendedSugs?.at(-1)} jogadores
			</span>
		</Button>
	)
}
