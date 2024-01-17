import {Form, useSearchParams} from '@remix-run/react'
import {useId} from 'react'
import {Input} from './ui/input'
import {Button} from './ui/button'
import {Search} from 'lucide-react'
import {Checkbox} from './ui/checkbox'
import {Label} from './ui/label'

export function SearchBar() {
	const id = useId()
	const [searchParams] = useSearchParams()
	const term = searchParams.get('q')
	return (
		<Form method='GET' action='/search'>
			<label htmlFor={`search-${id}`} className='sr-only'>
				Search
			</label>
			<div className='flex'>
				<div className='relative flex-grow'>
					<Input
						name='q'
						type='search'
						id={`search-${id}`}
						placeholder='Wingspan, 7 Wonders, Uno, etc'
						defaultValue={term ?? undefined}
						className='rounded-r-none pr-[80px]'
						minLength={3}
					/>
					<div className='absolute h-full top-0 right-2 flex items-center gap-2'>
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
