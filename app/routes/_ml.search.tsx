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
import {Card} from '~/components/ui/card'
import {cn} from '~/lib/utils'

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

export default function SearchPage() {
	const {results, term, errorMessage} =
		useLoaderData<typeof loader>()

	const [shouldHideAlert, hideAlert] = useReducer(
		() => true,
		false,
	)

	return (
		<div className='w-full flex-grow flex items-center gap-6 justify-center'>
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
						<ul className='grid grid-cols-3 gap-2'>
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
											{/* <div className='flex flex-col gap-2 border-accent hover:bg-accent p-2 rounded-md'> */}
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
					text='Pesquise por jogos na barra de busca'
				/>
			)}
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
		<div className='w-full flex-grow mt-6 flex flex-col items-center gap-6 justify-center'>
			<img className='h-[200px]' src={drawing} alt='' />

			<p className='max-w-prose font-bold text-large text-center text-pretty'>
				{text}
			</p>
		</div>
	)
}
