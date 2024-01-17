import {useFetcher} from '@remix-run/react'
import {
	Dice1Icon,
	Dice2Icon,
	Dice3Icon,
	Dice4Icon,
	Dice5Icon,
	Dice6Icon,
	X,
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
	className,
}: {
	gameId: string
	score: number | undefined
	className?: string
}) {
	const [hover, setHover] = useState<number>()
	const selected = score ? score : 0
	const fetcher = useFetcher()
	const optimistic = fetcher.formData
		? Number(fetcher.formData.get('score'))
		: undefined
	const highlighted =
		typeof hover === 'number'
			? hover
			: optimistic ?? selected
	return (
		<div
			className={cn(
				'w-full flex justify-stretch [&>*]:flex-grow',
			)}
		>
			<TooltipProvider>
				{dices.map((element, i) => (
					<fetcher.Form
						key={`dice${i}`}
						method='POST'
						action={`/game/${gameId}/evaluate`}
					>
						<input
							type='hidden'
							name='score'
							value={i + 1}
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
						<X
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
