import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import {BggBoardgame} from '~/lib/bgg'

export function PlayersTable({game}: {game: BggBoardgame}) {
	return (
		<Table>
			<TableHeader className='bg-accent'>
				<TableRow>
					<TableHead className='text-accent-foreground'>
						Nº de jogadores
					</TableHead>
					<TableHead className='text-accent-foreground'>
						Best
					</TableHead>
					<TableHead className='text-accent-foreground'>
						Recommended
					</TableHead>
					<TableHead className='text-accent-foreground'>
						Not Recommended
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{game.numPlayerSuggestion.map((suggestion) => (
					<PlayerNumberItem
						key={suggestion.numPlayers}
						suggestion={suggestion}
					/>
				))}
			</TableBody>
		</Table>
	)
}

function PlayerNumberItem({
	suggestion,
}: {
	suggestion: BggBoardgame['numPlayerSuggestion'][number]
}) {
	const best = Number(suggestion.best)
	const recommended = Number(suggestion.recommended)
	const notRecommended = Number(suggestion.notRecommended)
	const sumVotes = best + recommended + notRecommended

	return (
		<TableRow>
			<TableCell>{suggestion.numPlayers}</TableCell>
			<TableCell>
				{((best * 100) / sumVotes).toFixed(1)}% ({best})
			</TableCell>
			<TableCell>
				{((recommended * 100) / sumVotes).toFixed(1)}% (
				{recommended})
			</TableCell>
			<TableCell>
				{((notRecommended * 100) / sumVotes).toFixed(1)}% (
				{notRecommended})
			</TableCell>
		</TableRow>
	)
}
