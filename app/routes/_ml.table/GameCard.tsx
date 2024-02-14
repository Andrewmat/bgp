import {Link} from '@remix-run/react'
import {useMemo} from 'react'
import {EvaluationForm} from '~/components/EvaluationForm'
import {Alert} from '~/components/ui/alert'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
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
				<CardTitle>
					{game.name}: <em>{avgValue?.toFixed(2)}</em>
				</CardTitle>
			</CardHeader>
			<CardContent>
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
									<Link to={`/user/${ts.user.username}`}>
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
			</CardContent>
			<CardFooter className='flex-col '>
				{missing.length > 0 && (
					<>
						Faltando:{' '}
						{missing.map((t) => t.name).join(', ')}
					</>
				)}
				{missing.some((m) => m.id === sessionUserId) && (
					<Alert>Adicione sua nota para {game.name}</Alert>
				)}
				<div className='max-w-sm'>
					<EvaluationForm
						gameId={game.id}
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
