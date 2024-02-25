import {BggBoardgame} from '~/lib/bgg'
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '../ui/drawer'
import {Button} from '../ui/button'
import {suggestionByNumPlayers} from './utils'
import {SuggestionTable} from './SuggestionTable'
import {
	DefaultSuggestion,
	PickedSuggestion,
} from './SuggestionButton'
import {X} from 'lucide-react'

type TSuggestion =
	BggBoardgame['numPlayerSuggestion'][number]

export function NumPlayerSuggestion({
	suggestions,
	numPlayers,
}: {
	suggestions: TSuggestion[]
	numPlayers?: number
}) {
	const pickedSuggestion =
		typeof numPlayers === 'number'
			? suggestions.find((s) =>
					suggestionByNumPlayers(s, numPlayers),
				)
			: undefined

	return (
		<div className='w-full flex items-baseline gap-2 justify-end'>
			{pickedSuggestion && (
				<span>{pickedSuggestion.numPlayers} jog.:</span>
			)}
			<Drawer>
				<DrawerTrigger asChild>
					<Button
						variant='outline'
						className='flex gap-4 items-center'
					>
						{pickedSuggestion ? (
							<PickedSuggestion
								pickedSuggestion={pickedSuggestion}
							/>
						) : (
							<DefaultSuggestion
								suggestions={suggestions}
							/>
						)}
					</Button>
				</DrawerTrigger>
				<DrawerContent>
					<DrawerHeader className='flex items-center gap-2'>
						<DrawerTitle className='flex-grow'>
							Sugestão de jogadores
						</DrawerTitle>
						<DrawerClose asChild>
							<Button variant='outline'>
								<X />
								<span className='sr-only'>Close</span>
							</Button>
						</DrawerClose>
					</DrawerHeader>
					<SuggestionTable
						suggestions={suggestions}
						pickedSuggestion={pickedSuggestion}
					/>
				</DrawerContent>
			</Drawer>
		</div>
	)
}
