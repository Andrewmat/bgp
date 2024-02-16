import {Link} from '@remix-run/react'
import {DicesIcon, UnfoldHorizontalIcon} from 'lucide-react'
import {useMemo} from 'react'
import {EvaluationForm} from '~/components/EvaluationForm'
import {NumPlayerSuggestion} from '~/components/NumPlayerSuggestion'
import {Alert} from '~/components/ui/alert'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/ui/avatar'
import {Button} from '~/components/ui/button'
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
	TooltipTrigger,
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
				<Link
					to={`/game/${game.id}`}
					className='flex gap-2 items-center hover:underline focus:underline'
				>
					<Avatar>
						<AvatarImage src={game.thumbnail} />
						<AvatarFallback>{game.name}</AvatarFallback>
					</Avatar>
					<CardTitle>{game.name}</CardTitle>
				</Link>
			</CardHeader>
			<CardContent>
				<div className='flex flex-col items-start gap-2'>
					<Drawer>
						<DrawerTrigger asChild>
							<Button
								variant='ghost'
								className='flex gap-4 items-center'
							>
								{avgValue ? (
									<>
										<span className='flex gap-2'>
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
											<span>
												({tableScore.length} votos)
											</span>
										</span>
										<span className='flex gap-2'>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<UnfoldHorizontalIcon />
													</TooltipTrigger>
													<TooltipContent>
														Variância padrão da nota da mesa
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>

											<span>
												{(
													tableScore.reduce(
														(s, ts) =>
															s +
															Math.pow(
																ts.score - avgValue,
																2,
															),
														0,
													) / tableScore.length
												).toFixed(2)}
											</span>
										</span>
									</>
								) : (
									'Notas de quem você tá seguindo'
								)}
							</Button>
						</DrawerTrigger>
						<DrawerContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Usuário</TableHead>
										<TableHead className='text-center'>
											Nota
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
					<Alert className='flex gap-1 flex-col items-center'>
						<div>Adicione sua nota para {game.name}</div>
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
					</Alert>
				)}
			</CardFooter>
		</Card>
	)
}
