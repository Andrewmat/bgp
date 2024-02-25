import {Link} from '@remix-run/react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import {ScoreDisplay} from '~/components/DiceScore'
import {TooltipProvider} from '~/components/ui/tooltip'

type BasicUser = {
	id: string
	name: string
	username: string
}

interface GroupTableProps {
	groupScore: {
		user: BasicUser
		value: number
	}[]
}

export function GroupTable({groupScore}: GroupTableProps) {
	return (
		<TooltipProvider>
			<Table className='flex-grow'>
				<TableHeader>
					<TableRow>
						<TableHead className='text-center'>
							Usuário
						</TableHead>
						<TableHead className='text-center'>
							Nota
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{groupScore.map((gs) => (
						<TableRow key={gs.user.id}>
							<TableCell className='p-1'>
								<Link to={`/user/${gs.user.username}`}>
									{gs.user.name}
								</Link>
							</TableCell>
							<TableCell className='p-1 text-center'>
								<ScoreDisplay score={gs.value} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TooltipProvider>
	)
}
