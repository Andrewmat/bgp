import {Form, useSearchParams} from '@remix-run/react'
import {useEffect, useId, useState} from 'react'
import {Input} from './ui/input'
import {Button} from './ui/button'
import {Search} from 'lucide-react'
import {Checkbox} from './ui/checkbox'
import {Label} from './ui/label'

export function SearchBar() {
	const id = useId()
	const [searchParams] = useSearchParams()
	const term = searchParams.get('q')
	const [placeholder, setPlaceholder] = useState('')
	useEffect(() => {
		setPlaceholder(getPlaceholderGame())
	}, [])

	return (
		<Form method='GET' action='/search'>
			<div className='flex'>
				<div className='relative flex-grow'>
					<label
						htmlFor={`search-${id}`}
						className='sr-only'
					>
						Search
					</label>
					<Input
						name='q'
						type='search'
						id={`search-${id}`}
						placeholder={placeholder}
						defaultValue={term ?? undefined}
						className='rounded-r-none pr-20'
						minLength={3}
					/>
					<div className='absolute h-full top-0 right-3 flex items-center gap-2'>
						<Checkbox
							id={`exact-${id}`}
							name='exact'
							value='true'
						/>
						<Label htmlFor={`exact-${id}`}>Exata</Label>
					</div>
				</div>
				<Button type='submit' className='rounded-l-none'>
					<span className='sr-only'>Pesquisar</span>
					<Search />
				</Button>
			</div>
		</Form>
	)
}

const placeholderGames = [
	'Azul',
	'7 Wonders',
	'Carcassone',
	'Terraforming Mars',
	'Eldritch Horror',
	// 'Race for the Galaxy',
	// 'Uno',
	// "It's a Wonderful World",
]

function getPlaceholderGame() {
	const randIndex = Math.floor(
		Math.random() * placeholderGames.length,
	)
	return placeholderGames[randIndex]
}
