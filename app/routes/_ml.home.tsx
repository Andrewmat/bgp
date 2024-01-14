import type {
	LoaderFunctionArgs,
	MetaFunction,
} from '@remix-run/node'
import {
	Form,
	Link,
	json,
	useLoaderData,
} from '@remix-run/react'
import {Button} from '~/components/ui/button'
import {Input} from '~/components/ui/input'
import {ExternalLink, Search} from 'lucide-react'
import {BggSearchResult, searchGames} from '~/lib/bgg'
import {useId} from 'react'
import {Avatar, AvatarImage} from '~/components/ui/avatar'
import {getUser} from '~/lib/login/auth.server'
import {AvatarFallback} from '@radix-ui/react-avatar'
import {Label} from '~/components/ui/label'
import {Checkbox} from '~/components/ui/checkbox'

export const meta: MetaFunction = () => {
	return [
		{title: 'BGP | Board Game Planilha'},
		{
			name: 'description',
			content: 'Procure e revise board games!',
		},
	]
}

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const searchParams = new URL(request.url).searchParams
	const term = searchParams.get('q')
	let results: BggSearchResult[] | null = null
	if (typeof term === 'string') {
		const exact = searchParams.get('exact')
		results = await searchGames(term, exact === 'true')
	}

	return json({
		term,
		results,
	})
}

export default function IndexPage() {
	const {results, term} = useLoaderData<typeof loader>()

	return (
		<>
			<main className='container my-4'>
				<SearchForm defaultTerm={term} />
				{results && (
					<ul className='grid grid-cols-3 gap-2 mt-6'>
						{results.map((game) => (
							<li key={game.id}>
								<div className='flex flex-col gap-2 border-accent hover:bg-accent p-2 rounded-md'>
									<Link
										to={`/game/${game.id}`}
										className='hover:underline focus:underline'
									>
										{game.name} (
										<em>
											<small>{game.yearPublished}</small>
										</em>
										)
									</Link>
									<Link
										to={`https://boardgamegeek.com/boardgame/${game.id}`}
										target='_blank'
										rel='noreferrer'
										onClick={(e) => e.stopPropagation()}
									>
										<ExternalLink size='1em' />
									</Link>
								</div>
							</li>
						))}
					</ul>
				)}
			</main>
		</>
	)
}

function SearchForm({
	defaultTerm,
}: {
	defaultTerm: string | null
}) {
	const id = useId()
	return (
		<Form method='GET'>
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
				<div className='flex ml-2 items-center gap-2'>
					<Checkbox
						id={`exact-${id}`}
						name='exact'
						value='true'
					/>
					<Label htmlFor={`exact-${id}`}>Exact</Label>
				</div>
			</div>
		</Form>
	)
}
