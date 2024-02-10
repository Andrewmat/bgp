import {useFetcher, useLocation} from '@remix-run/react'
import {
	Dice1Icon as Dice1,
	Dice2Icon as Dice2,
	Dice3Icon as Dice3,
	Dice4Icon as Dice4,
	Dice5Icon as Dice5,
	Dice6Icon as Dice6,
	Trash2Icon as Trash,
} from 'lucide-react'
import {cloneElement, useState} from 'react'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import {cn} from '~/lib/utils'

export function EvaluationForm({
	gameId,
	score,
}: {
	gameId: string
	score: number | undefined
	className?: string
}) {
	const [hover, setHover] = useState<number>()
	const selected = score ? score : 0
	const location = useLocation()
	const fetcher = useFetcher()
	const optimistic = fetcher.formData
		? Number(fetcher.formData.get('score'))
		: undefined
	const highlighted =
		typeof hover === 'number'
			? hover
			: optimistic ?? selected
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
						score == null ? 'invisible' : 'animate-in',
					)}
				>
					<input
						type='hidden'
						name='method'
						value='delete'
					/>
					<SimpleTooltip tooltip={<p>Deletar nota</p>}>
						<Trash
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
	<Dice1 size='100%' />,
	<Dice2 size='100%' />,
	<Dice3 size='100%' />,
	<Dice4 size='100%' />,
	<Dice5 size='100%' />,
	<Dice6 size='100%' />,
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