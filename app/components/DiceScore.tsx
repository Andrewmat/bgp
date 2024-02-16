import {
	Dice1Icon,
	Dice2Icon,
	Dice3Icon,
	Dice4Icon,
	Dice5Icon,
	Dice6Icon,
} from 'lucide-react'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './ui/tooltip'

export function DiceScore({score}: {score: number}) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					{dices[score as keyof typeof dices] ?? null}
				</TooltipTrigger>
				<TooltipContent>Nota {score}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
const dices = {
	1: <Dice1Icon />,
	2: <Dice2Icon />,
	3: <Dice3Icon />,
	4: <Dice4Icon />,
	5: <Dice5Icon />,
	6: <Dice6Icon />,
}
