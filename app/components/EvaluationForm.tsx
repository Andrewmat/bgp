import {useFetcher, useLocation} from '@remix-run/react'
import {CheckIcon, StarIcon, Trash2Icon} from 'lucide-react'
import {ReactNode, useEffect, useState} from 'react'
import {toast} from 'sonner'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import {cn} from '~/lib/utils'
import {type action as evaluateAction} from '~/routes/game.$gameId.evaluate'

export function EvaluationForm({
	gameId,
	score,
	hiddenTrashClassName = 'invisible',
	side,
}: {
	gameId: string
	score: number | undefined
	className?: string
	hiddenTrashClassName?: 'hidden' | 'invisible'
	side?: ReactNode
}) {
	const [hover, setHover] = useState<number>()
	const selected = score ? score : 0
	const location = useLocation()
	const fetcher = useFetcher<typeof evaluateAction>()

	const optimistic = fetcher.formData
		? Number(fetcher.formData.get('score'))
		: undefined
	const highlighted =
		typeof hover === 'number'
			? hover
			: optimistic ?? selected

	useEffect(() => {
		if (typeof fetcher.data !== 'object') {
			return
		}
		toast.success(
			{
				delete: 'Avaliação removida',
				post: 'Avaliado com sucesso',
			}[fetcher.data.intent],
			{
				icon: <CheckIcon />,
			},
		)
	}, [fetcher.data])

	return (
		<div className='w-full'>
			<TooltipProvider>
				<div className='grid grid-cols-6 gap-y-2 gap-x-0 sm:gap-x-2'>
					{Array.from({length: 10}).map((_, i) => (
						<fetcher.Form
							key={i}
							method='POST'
							action={`/game/${gameId}/evaluate`}
							className='flex items-center mx-auto'
						>
							<input
								type='hidden'
								name='score'
								value={i + 1}
							/>
							<input
								type='hidden'
								name='location'
								value={location.pathname}
							/>
							<SimpleTooltip
								tooltip={<p>Nota {i + 1}</p>}
								asChild
							>
								<button
									className={cn(
										'appearance-none focus-visible:ring focus-visible:outline-none',
									)}
									onMouseOver={() => {
										setHover(i + 1)
									}}
									onFocus={() => {
										setHover(i + 1)
									}}
									onMouseOut={() => {
										setHover(undefined)
									}}
									onBlur={() => {
										setHover(undefined)
									}}
								>
									<StarIcon
										className={cn(
											'fill-muted stroke-muted-foreground',
											'hover:fill-yellow-400 hover:stroke-black',
											'dark:hover:fill-yellow-600 dark:hover:stroke-white',
											i < highlighted &&
												'fill-yellow-200 stroke-yellow-300 dark:fill-yellow-800 dark:stroke-yellow-700',
										)}
									/>
								</button>
							</SimpleTooltip>
						</fetcher.Form>
					))}
					{side ? (
						<div className='col-start-6 row-start-1 row-end-3'>
							{side}
						</div>
					) : (
						<fetcher.Form
							method='POST'
							action={`/game/${gameId}/evaluate`}
							className={cn(
								'col-start-6 row-start-1 row-end-3 flex items-center justify-center',
								score == null
									? hiddenTrashClassName
									: 'animate-in',
							)}
						>
							<input
								type='hidden'
								name='method'
								value='delete'
							/>
							<SimpleTooltip tooltip={<p>Deletar nota</p>}>
								<Trash2Icon className='fill-muted stroke-muted-foreground hover:fill-destructive hover:stroke-destructive-foreground focus-visible:fill-destructive focus-visible:stroke-destructive-foreground' />
							</SimpleTooltip>
						</fetcher.Form>
					)}
				</div>
			</TooltipProvider>
		</div>
	)
}

function SimpleTooltip({
	tooltip,
	children,
	asChild,
}: {
	tooltip: React.ReactNode
	children: React.ReactNode
	asChild?: boolean
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild={asChild}>
				{children}
			</TooltipTrigger>
			<TooltipContent>{tooltip}</TooltipContent>
		</Tooltip>
	)
}
