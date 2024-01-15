import type {
	LoaderFunctionArgs,
	MetaFunction,
} from '@remix-run/node'
import {Link, json, useLoaderData} from '@remix-run/react'
import {ExternalLink} from 'lucide-react'
import {BggSearchResult, searchGames} from '~/lib/bgg'
import {SearchForm} from '~/components/SearchForm'

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
	const term = searchParams.get('q') ?? undefined
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
