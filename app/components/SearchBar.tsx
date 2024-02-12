import {
	Form,
	useNavigation,
	useSearchParams,
} from '@remix-run/react'
import {useEffect, useId, useState} from 'react'
import {Input} from './ui/input'
import {Button} from './ui/button'
import {Search, Shell} from 'lucide-react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select'

export function SearchBar() {
	const id = useId()
	const [searchParams] = useSearchParams()
	const term = searchParams.get('q')
	const entity = searchParams.get('e')
	const [placeholder, setPlaceholder] = useState('')
	useEffect(() => {
		setPlaceholder(getPlaceholderGame())
	}, [])
	const nav = useNavigation()

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
							className='flex-grow basis-0 rounded-r-none'
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
					<input type='hidden' name='exact' value='false' />
				</div>
				<Button
					type='submit'
					className='rounded-l-none'
					disabled={nav.state !== 'idle'}
				>
					<span className='sr-only'>Pesquisar</span>
					{nav.state === 'idle' ? (
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
