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
}: {
	gameId: string
	score: number | undefined
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
		<div className='flex'>
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
								size: 30,
								className: cn(
									'pl-0 pr-2',
									i < highlighted && 'fill-green-500',
								),
								onMouseOver: () => setHover(i + 1),
								onMouseOut: () => setHover(undefined),
							})}
						</SimpleTooltip>
					</fetcher.Form>
				))}
				<fetcher.Form
					method='POST'
					action={`/game/${gameId}/evaluate`}
				>
					<input
						type='hidden'
						name='method'
						value='delete'
					/>
					<SimpleTooltip tooltip={<p>Deletar nota</p>}>
						<X size={30} className='stroke-primary' />
					</SimpleTooltip>
				</fetcher.Form>
			</TooltipProvider>
		</div>
	)
}

const dices = [
	/* eslint-disable react/jsx-key */
	<Dice1Icon />,
	<Dice2Icon />,
	<Dice3Icon />,
	<Dice4Icon />,
	<Dice5Icon />,
	<Dice6Icon />,
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
