import {EvaluationForm} from '~/components/EvaluationForm'
import {BggBoardgame} from '~/lib/bgg'

export function EvaluationFormOwn({
	game,
	score,
}: {
	game: BggBoardgame
	score: number | undefined
}) {
	return <EvaluationForm gameId={game.id} score={score} />
}
