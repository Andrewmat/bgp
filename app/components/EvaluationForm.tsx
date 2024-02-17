import {
	useActionData,
	useFetcher,
	useLocation,
} from '@remix-run/react'
import {
	CheckIcon,
	Dice1Icon,
	Dice2Icon,
	Dice3Icon,
	Dice4Icon,
	Dice5Icon,
	Dice6Icon,
	Trash2Icon,
} from 'lucide-react'
import {cloneElement, useEffect, useState} from 'react'
import {toast} from 'sonner'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import {cn} from '~/lib/utils'
import {action as evaluateAction} from '~/routes/game.$gameId.evaluate'

export function EvaluationForm({
	gameId,
	score,
	hiddenTrashClassName = 'invisible',
}: {
	gameId: string
	score: number | undefined
	className?: string
	hiddenTrashClassName?: 'hidden' | 'invisible'
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
		<div className='w-full flex justify-stretch [&>*]:flex-grow'>
			<TooltipProvider>
				{dices.map((element, i) => (
					<fetcher.Form
						key={`dice${i}`}
						method='POST'
						action={`/game/${gameId}/evaluate`}
						className='flex items-center'
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
						<SimpleTooltip tooltip={<p>Nota {i + 1}</p>}>
							{cloneElement(element, {
								className: cn(
									'fill-muted stroke-muted-foreground hover:fill-accent hover:stroke-accent-foreground focus-visible:fill-accent focus-visible:stroke-accent-foreground',
									i < highlighted &&
										'fill-mutedaccent stroke-mutedaccent-foreground',
								),
								onMouseOver: () => setHover(i + 1),
								onFocus: () => setHover(i + 1),
								onMouseOut: () => setHover(undefined),
								onBlur: () => setHover(undefined),
							})}
						</SimpleTooltip>
					</fetcher.Form>
				))}

				<fetcher.Form
					method='POST'
					action={`/game/${gameId}/evaluate`}
					className={cn(
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
						<Trash2Icon
							size='100%'
							className='fill-muted stroke-muted-foreground hover:fill-destructive hover:stroke-destructive-foreground focus-visible:fill-destructive focus-visible:stroke-destructive-foreground'
						/>
					</SimpleTooltip>
				</fetcher.Form>
			</TooltipProvider>
		</div>
	)
}

const dices = [
	/* eslint-disable react/jsx-key */
	<Dice1Icon size='100%' />,
	<Dice2Icon size='100%' />,
	<Dice3Icon size='100%' />,
	<Dice4Icon size='100%' />,
	<Dice5Icon size='100%' />,
	<Dice6Icon size='100%' />,
	/* eslint-enable react/jsx-key */
] as const

function SimpleTooltip({
	tooltip,
	children,
}: {
	tooltip: React.ReactNode
	children: React.ReactNode
}) {
	return (
		<Tooltip>
			<TooltipTrigger>{children}</TooltipTrigger>
			<TooltipContent>{tooltip}</TooltipContent>
		</Tooltip>
	)
}
