import type {LoaderFunctionArgs} from '@remix-run/node'
import {
	MetaFunction,
	json,
	redirect,
	useLoaderData,
} from '@remix-run/react'
import {AlertCircleIcon} from 'lucide-react'
import noResultsImage from '~/assets/undraw_empty.svg'
import emptyStateImage from '~/assets/undraw_searching.svg'
import {AlertClosable} from '~/components/ui/alert-closable'
import {searchUsers} from '~/lib/db/user.server'
import {getSessionUser} from '~/lib/login/auth.server'
import {TooltipProvider} from '~/components/ui/tooltip'
import {ResultUser} from './ResultUser'
import {ResultGame} from './ResultGame'
import {DrawingWrapper} from './DrawingWrapper'
import Pagination from '~/components/Pagination'
import {getScoresSearch} from '~/lib/db/score.server'
import {searchExternalGames} from '~/lib/db/games.server'

export const meta: MetaFunction<typeof loader> = ({
	data,
}) => {
	return [
		{title: `Busca por "${data?.term}" | BGP`},
		{
			name: 'description',
			content: 'Pesquise e revise board games!',
		},
	]
}

const PAGE_SIZE = 12

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const searchParams = new URL(request.url).searchParams
	const term = searchParams.get('q') ?? undefined
	const entity =
		searchParams.get('e') === 'user' ? 'user' : 'game'
	const exact = searchParams.get('exact')
	const page = Number(searchParams.get('page')) || 1

	if (
		typeof term === 'string' &&
		term.length === 0 &&
		entity === 'game'
	) {
		return redirect('/search')
	}

	const user = await getSessionUser(request)
	if (entity === 'user') {
		try {
			const results = await searchUsers(
				term ?? '',
				exact === 'true',
				user?.id,
				(page - 1) * PAGE_SIZE,
				PAGE_SIZE,
			)
			return json({
				term,
				entity,
				results,
				user,
				page,
				errorMessage: null,
				scores: null,
			} as const)
		} catch (e) {
			return json({
				term,
				entity,
				user: null,
				results: null,
				page,
				scores: null,
				errorMessage:
					(e as Error | undefined)?.message ??
					'Houve um erro ao fazer pesquisa',
			} as const)
		}
	}
	if (term == null) {
		return json({
			term: null,
			entity,
			user,
			results: null,
			page,
			errorMessage: null,
			scores: null,
		} as const)
	}

	if (term.length < 3) {
		return json({
			term,
			entity,
			results: null,
			scores: null,
			user,
			page,
			errorMessage:
				'Termo de pesquisa deve ter no mínimo 3 caracteres',
		} as const)
	}

	try {
		const results = await searchExternalGames(
			term,
			exact === 'true',
		)
		return json({
			term,
			entity,
			results,
			scores: user
				? await getScoresSearch({
						userId: user.id,
						gameIds: results.map((r) => r.id),
					})
				: null,
			user,
			page,
			errorMessage: null,
		} as const)
	} catch (e) {
		return json({
			term,
			entity,
			page,
			user: null,
			results: null,
			scores: null,
			errorMessage:
				(e as Error | undefined)?.message ??
				'Houve um erro ao fazer pesquisa',
		} as const)
	}
}

export default function SearchPage() {
	const {
		entity,
		results,
		term,
		errorMessage,
		user,
		page,
		scores,
	} = useLoaderData<typeof loader>()

	return (
		<div className='flex-grow flex flex-col gap-6'>
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
							<h2 className='mb-2'>
								{entity === 'user' ? 'Usuários' : 'Jogos'}{' '}
								&quot;{term}&quot; ({results.length})
							</h2>
							<div className='w-full'>
								<TooltipProvider>
									<ul className='grid sm:grid-cols-2 lg:grid-cols-3 gap-2'>
										{entity === 'user'
											? results.map((u) => (
													<li key={u.id}>
														<ResultUser
															user={u}
															sessionUserId={user?.id}
														/>
													</li>
												))
											: results.map((game) => (
													<li key={game.id}>
														<ResultGame
															game={game}
															score={
																scores?.find(
																	(s) =>
																		s.gameId === game.id,
																)?.value
															}
														/>
													</li>
												))}
									</ul>
								</TooltipProvider>
							</div>
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
			{entity === 'user' && (
				<Pagination
					hasNext={
						results?.length
							? results.length === PAGE_SIZE
							: false
					}
					page={page}
					searchParam='page'
				/>
			)}
		</div>
	)
}
