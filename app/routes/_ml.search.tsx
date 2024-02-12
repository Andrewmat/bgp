import type {LoaderFunctionArgs} from '@remix-run/node'
import {
	Link,
	json,
	redirect,
	useLoaderData,
} from '@remix-run/react'
import {ExternalLink, AlertCircleIcon} from 'lucide-react'
import {BggSearchResult, searchGames} from '~/lib/bgg'
import noResultsImage from '~/assets/undraw_empty.svg'
import emptyStateImage from '~/assets/undraw_searching.svg'
import {Card} from '~/components/ui/card'
import {cn} from '~/lib/utils'
import {AlertClosable} from '~/components/ui/alert-closable'
import {searchUsers} from '~/lib/db/user.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const searchParams = new URL(request.url).searchParams
	const term = searchParams.get('q') ?? undefined

	if (typeof term === 'string' && term.length === 0) {
		return redirect('/search')
	}

	const entity =
		searchParams.get('e') === 'user' ? 'user' : 'game'
	if (term == null) {
		return json({
			term: null,
			entity,
			results: null,
			errorMessage: null,
		} as const)
	}

	if (term.length < 3) {
		return json({
			term,
			entity,
			results: null,
			errorMessage:
				'Termo de pesquisa deve ter no mínimo 3 caracteres',
		} as const)
	}

	const exact = searchParams.get('exact')
	try {
		if (entity === 'user') {
			const results = await searchUsers(term)
			return json({
				term,
				entity,
				results,
				errorMessage: null,
			} as const)
		} else {
			const results = await searchGames(
				term,
				exact === 'true',
			)
			return json({
				term,
				entity,
				results,
				errorMessage: null,
			} as const)
		}
	} catch (e) {
		return json({
			term,
			entity,
			results: null,
			errorMessage:
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(e as any)?.message ??
				'Houve um erro ao fazer pesquisa',
		} as const)
	}
}

export default function SearchPage() {
	const {entity, results, term, errorMessage} =
		useLoaderData<typeof loader>()

	if (entity === 'user') {
		results
	} else {
		results
	}
	return (
		<div className='w-full flex-grow flex gap-6'>
			{errorMessage && (
				<AlertClosable
					variant='destructive'
					className='transition-colors hover:bg-destructive/15 focus-visible:bg-destructive/15'
				>
					<span className='inline-flex gap-2'>
						<AlertCircleIcon />
						<span>{errorMessage}</span>
					</span>
				</AlertClosable>
			)}
			{results ? (
				<>
					{results.length > 0 ? (
						<>
							{entity === 'user' ? (
								<ResultsUsers results={results} />
							) : (
								<ResultsGames results={results} />
							)}
						</>
					) : (
						<DrawingWrapper
							drawing={noResultsImage}
							text={
								<>
									<span className='text-xl'>Ops :(</span>
									<br />
									Não encontrei nada para &quot;{term}
									&quot;
								</>
							}
						/>
					)}
				</>
			) : (
				<DrawingWrapper
					drawing={emptyStateImage}
					text='Pesquise por jogos na barra de busca'
				/>
			)}
		</div>
	)
}

function ResultsGames({
	results,
}: {
	results: BggSearchResult[]
}) {
	return (
		<div>
			<h1 className='mb-2'>Games ({results.length})</h1>
			<ul className='grid grid-cols-3 gap-2 self-start'>
				{results.map((game) => (
					<li key={game.id} className='relative'>
						<Link
							to={`/game/${game.id}`}
							className={cn(
								'[&>*]:hover:bg-accent',
								'[&>*]:hover:text-accent-foreground',
								'[&>*]:focus-visible:bg-accent',
								'[&>*]:focus-visible:text-accent-foreground',
							)}
						>
							<Card className='p-5 h-full'>
								{game.name} (
								<em>
									<small>{game.yearPublished}</small>
								</em>
								)
							</Card>
						</Link>
						<Link
							to={`https://boardgamegeek.com/boardgame/${game.id}`}
							target='_blank'
							rel='noreferrer'
							onClick={(e) => e.stopPropagation()}
							className='absolute right-2 top-2'
						>
							<ExternalLink size='0.8rem' />
						</Link>
					</li>
				))}
			</ul>
		</div>
	)
}

function ResultsUsers({
	results,
}: {
	results: {
		id: string
		username: string
		name: string
		discordId: string | null
	}[]
}) {
	return (
		<div>
			<h1 className='mb-2'>Users ({results.length})</h1>
			<ul className='grid grid-cols-3 gap-2 self-start'>
				{results.map((user) => (
					<li key={user.id}>
						<Link
							to={`/user/${user.username}`}
							className={cn(
								'[&>*]:hover:bg-accent',
								'[&>*]:hover:text-accent-foreground',
								'[&>*]:focus-visible:bg-accent',
								'[&>*]:focus-visible:text-accent-foreground',
							)}
						>
							<Card className='p-5 h-full'>
								{user.name} (
								<em>
									<small>@{user.username}</small>
								</em>
								)
							</Card>
						</Link>
					</li>
				))}
			</ul>
		</div>
	)
}

function DrawingWrapper({
	drawing,
	text,
}: {
	drawing: string
	text: React.ReactNode
}) {
	return (
		<div className='w-full flex-grow mt-6 flex flex-col items-center gap-6 justify-center self-center'>
			<img className='h-[200px]' src={drawing} alt='' />

			<p className='max-w-prose font-bold text-large text-center text-pretty'>
				{text}
			</p>
		</div>
	)
}
