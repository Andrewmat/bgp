import type {LoaderFunctionArgs} from '@remix-run/node'
import {
	json,
	redirect,
	useLoaderData,
} from '@remix-run/react'
import {AlertCircleIcon} from 'lucide-react'
import {searchGames} from '~/lib/bgg'
import noResultsImage from '~/assets/undraw_empty.svg'
import emptyStateImage from '~/assets/undraw_searching.svg'
import {AlertClosable} from '~/components/ui/alert-closable'
import {searchUsers} from '~/lib/db/user.server'
import {ResultsUsers} from './ResultsUsers'
import {ResultsGames} from './ResultsGames'
import {DrawingWrapper} from './DrawingWrapper'

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
