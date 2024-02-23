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
	DefaultSuggestionButton,
	SuggestionButton,
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
		<div className='flex items-baseline'>
			{pickedSuggestion && (
				<span className='mr-2'>
					{pickedSuggestion.numPlayers} jogadores
				</span>
			)}
			<Drawer>
				<DrawerTrigger>
					{pickedSuggestion ? (
						<SuggestionButton
							pickedSuggestion={pickedSuggestion}
						/>
					) : (
						<DefaultSuggestionButton
							suggestions={suggestions}
						/>
					)}
				</DrawerTrigger>
				<DrawerContent>
					<DrawerHeader className='flex items-center gap-2'>
						<DrawerTitle className='flex-grow'>
							Sugestão de número de jogadores
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
