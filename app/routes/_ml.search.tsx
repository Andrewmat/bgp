import {useReducer} from 'react'
import type {
	LoaderFunctionArgs,
	MetaFunction,
} from '@remix-run/node'
import {Link, json, useLoaderData} from '@remix-run/react'
import {
	ExternalLink,
	AlertCircleIcon,
	X,
} from 'lucide-react'
import {BggSearchResult, searchGames} from '~/lib/bgg'
import noResultsImage from '~/assets/undraw_empty.svg'
import emptyStateImage from '~/assets/undraw_searching.svg'
import {Alert} from '~/components/ui/alert'
import {Button} from '~/components/ui/button'

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
		if (term.length < 3) {
			return json({
				term,
				results: null,
				errorMessage:
					'Termo de pesquisa deve ter no mínimo 3 caracteres',
			})
		}

		const exact = searchParams.get('exact')
		try {
			results = await searchGames(term, exact === 'true')
		} catch (e) {
			return json({
				term,
				results: null,
				fieldMessage: null,
				errorMessage:
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(e as any)?.message ??
					'Houve um erro ao fazer pesquisa',
			})
		}
	}

	return json({
		term,
		results,
		errorMessage: null,
	})
}

export default function IndexPage() {
	const {results, term, errorMessage} =
		useLoaderData<typeof loader>()

	const [shouldHideAlert, hideAlert] = useReducer(
		() => true,
		false,
	)

	return (
		<>
			{errorMessage && !shouldHideAlert && (
				<Alert
					variant='destructive'
					className='flex justify-between'
				>
					<span className='inline-flex gap-2'>
						<AlertCircleIcon />
						<span>{errorMessage}</span>
					</span>

					<button
						className='appearance-none rounded-full transition-colors hover:bg-destructive/15 focus-visible:bg-destructive/15'
						onClick={hideAlert}
					>
						<X className='stroke-muted-foreground' />
					</button>
				</Alert>
			)}
			{results ? (
				<>
					{results.length > 0 ? (
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
					) : (
						<DrawingWrapper
							drawing={noResultsImage}
							text={
								<>
									<span className='text-xl'>Ops :(</span>
									<br />
									Não encontrei nada para &quot;{term}&quot;
								</>
							}
						/>
					)}
				</>
			) : (
				<DrawingWrapper
					drawing={emptyStateImage}
					text='Procure jogos no BGP!'
				/>
			)}
		</>
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
		<div className='w-full h-[450px] mt-6 flex flex-col items-center gap-6 justify-center'>
			<img className='h-[200px]' src={drawing} alt='' />

			<p className='w-[150px] font-bold text-large text-center text-pretty'>
				{text}
			</p>
		</div>
	)
}
