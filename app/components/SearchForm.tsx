import {Form} from '@remix-run/react'
import {useId} from 'react'
import {Input} from './ui/input'
import {Button} from './ui/button'
import {Search} from 'lucide-react'
import {Checkbox} from './ui/checkbox'
import {Label} from './ui/label'

export function SearchForm({
	defaultTerm,
	hideExact = false,
}: {
	defaultTerm?: string
	hideExact?: boolean
}) {
	const id = useId()
	return (
		<Form method='GET' action='/home'>
			<label htmlFor={`search-${id}`} className='sr-only'>
				Search
			</label>
			<div className='flex'>
				<Input
					name='q'
					type='search'
					id={`search-${id}`}
					placeholder='Wingspan, 7 Wonders, Uno, etc'
					defaultValue={defaultTerm ?? undefined}
					className='rounded-r-none'
				/>
				<Button type='submit' className='rounded-l-none'>
					<span className='sr-only'>Submit Search</span>
					<Search />
				</Button>
				{!hideExact && (
					<div className='flex ml-3 items-center gap-2'>
						<Checkbox
							id={`exact-${id}`}
							name='exact'
							value='true'
						/>
						<Label htmlFor={`exact-${id}`}>
							Busca exata
						</Label>
					</div>
				)}
			</div>
		</Form>
	)
}
