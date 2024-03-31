import {
	Form,
	useNavigation,
	useSearchParams,
} from '@remix-run/react'
import {useEffect, useId, useState} from 'react'
import {Input} from './ui/input'
import {Button} from './ui/button'
import {HelpCircleIcon, Search, Shell} from 'lucide-react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select'
import {Checkbox} from './ui/checkbox'
import {Label} from './ui/label'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './ui/tooltip'

export function SearchBar() {
	const id = useId()
	const [searchParams] = useSearchParams()
	const term = searchParams.get('q')
	const entity = searchParams.get('e')
	const exact = searchParams.get('exact') === 'true'
	const [placeholder, setPlaceholder] = useState('')
	useEffect(() => {
		setPlaceholder(getPlaceholderGame())
	}, [])
	const nav = useNavigation()
	const isSearchNav =
		nav.formAction === '/search' && nav.formMethod === 'GET'

	return (
		<Form method='GET' action='/search'>
			<div className='flex'>
				<div className='relative flex-grow flex'>
					<label
						className='sr-only'
						htmlFor={`trigger-${id}`}
					>
						Entity
					</label>
					<Select defaultValue={entity ?? 'game'} name='e'>
						<SelectTrigger
							className='flex-grow basis-0 rounded-r-none border-r-0'
							id={`trigger-${id}`}
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='game'>Jogos</SelectItem>
							<SelectItem value='user'>Usuários</SelectItem>
						</SelectContent>
					</Select>
					<label htmlFor={`q-${id}`} className='sr-only'>
						Search
					</label>
					<Input
						name='q'
						type='search'
						id={`q-${id}`}
						placeholder={placeholder}
						defaultValue={term ?? undefined}
						className='rounded-none flex-grow-[3] basis-0'
						minLength={3}
					/>
					<div className='absolute h-full top-0 right-3 flex items-center gap-2'>
						<Checkbox
							id={`exact-${id}`}
							name='exact'
							value='true'
							defaultChecked={exact}
						/>
						<Label htmlFor={`exact-${id}`}>Exata</Label>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<HelpCircleIcon
										size='1em'
										className='stroke-muted-foreground hover:stroke-foreground focus-visible:stroke-foreground'
									/>
								</TooltipTrigger>
								<TooltipContent>
									Filtrar resultados exatamente iguais ao
									texto do campo
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>

				<Button
					type='submit'
					className='rounded-l-none'
					disabled={isSearchNav}
				>
					<span className='sr-only'>Pesquisar</span>
					{!isSearchNav ? (
						<Search />
					) : (
						<Shell className='animate-spin' />
					)}
				</Button>
			</div>
		</Form>
	)
}

const placeholderGames = [
	'Azul',
	'7 Wonders',
	'Carcassonne',
	'Terraforming Mars',
	'Eldritch Horror',
	'Race for the Galaxy',
	'Uno',
	"It's a Wonderful World",
]

function getPlaceholderGame() {
	const randIndex = Math.floor(
		Math.random() * placeholderGames.length,
	)
	return placeholderGames[randIndex]
}
