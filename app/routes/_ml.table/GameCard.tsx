import {TooltipTrigger} from '@radix-ui/react-tooltip'
import {Link} from '@remix-run/react'
import {DicesIcon} from 'lucide-react'
import {useMemo} from 'react'
import {EvaluationForm} from '~/components/EvaluationForm'
import {NumPlayerSuggestion} from '~/components/NumPlayerSuggestion'
import {Alert} from '~/components/ui/alert'
import {buttonVariants} from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {
	Drawer,
	DrawerContent,
	DrawerTrigger,
} from '~/components/ui/drawer'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
} from '~/components/ui/tooltip'
import {ScoreTableGame} from '~/lib/db/score.server'
import {SessionTable} from '~/lib/login/session.server'

export function GameCard({
	game,
	avgValue,
	tableScore,
	sessionUserId,
	table,
}: {
	game: ScoreTableGame['game']
	avgValue: ScoreTableGame['avgValue']
	tableScore: ScoreTableGame['table']
	sessionUserId: string | null
	table: SessionTable
}) {
	const missing = useMemo(
		() =>
			table.filter(
				(t) =>
					!tableScore.some((ts) => ts.user.id === t.id),
			),
		[table, tableScore],
	)
	return (
		<Card>
			<CardHeader>
				<CardTitle>{game.name}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='flex flex-col items-start gap-2'>
					<Drawer>
						<DrawerTrigger>
							<span
								className={buttonVariants({
									variant: 'ghost',
									className: 'flex gap-2 items-center',
								})}
							>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<DicesIcon />
										</TooltipTrigger>
										<TooltipContent>
											Média de nota da mesa
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<span>{avgValue?.toFixed(2)}</span>
								<span>({tableScore.length} votos)</span>
							</span>
						</DrawerTrigger>
						<DrawerContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>User</TableHead>
										<TableHead className='text-center'>
											Score
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{tableScore.map((ts) => (
										<TableRow key={ts.user.id}>
											<TableCell className='p-1'>
												<Link
													to={`/user/${ts.user.username}`}
												>
													{ts.user.name}
												</Link>
											</TableCell>
											<TableCell className='text-center p-1'>
												{ts.score}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</DrawerContent>
					</Drawer>
					<div className='flex justify-center'>
						<NumPlayerSuggestion
							suggestions={game.numPlayerSuggestion}
							numPlayers={table.length}
						/>
					</div>
				</div>
			</CardContent>
			<CardFooter className='flex flex-col gap-2'>
				{missing.length > 0 && (
					<Alert>
						Faltando notas de{' '}
						{new Intl.ListFormat('pt-BR', {}).format(
							missing.map((t) => t.name),
						)}
					</Alert>
				)}
				{missing.some((m) => m.id === sessionUserId) && (
					<Alert>Adicione sua nota para {game.name}</Alert>
				)}
				<div className='max-w-[300px]'>
					<EvaluationForm
						gameId={game.id}
						hiddenTrashClassName='hidden'
						score={
							tableScore.find(
								(ts) => ts.user.id === sessionUserId,
							)?.score
						}
					/>
				</div>
			</CardFooter>
		</Card>
	)
}
