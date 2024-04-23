import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	json,
	redirect,
} from '@remix-run/node'
import {
	Form,
	Link,
	useActionData,
	useLoaderData,
} from '@remix-run/react'
import {useEffect, useId, useState} from 'react'
import invariant from 'tiny-invariant'
import {StarIcon} from 'lucide-react'
import {getGameId} from '~/lib/bgg'
import {assertAuthenticated} from '~/lib/login/auth.server'
import * as RadioGroup from '@radix-ui/react-radio-group'
import {Textarea} from '~/components/ui/textarea'
import {Label} from '~/components/ui/label'
import {cn} from '~/lib/utils'
import {Button} from '~/components/ui/button'
import {Alert} from '~/components/ui/alert'
import {
	getReviewByUserGame,
	getReviewsByGame,
	upsertReview,
} from '~/lib/db/review.server'
import {Quote} from '~/components/QuoteReview'
import {ScoreDisplay} from '~/components/ScoreDisplay'
import {TooltipProvider} from '~/components/ui/tooltip'

export async function loader({
	params,
	request,
}: LoaderFunctionArgs) {
	invariant(params.gameId, 'Expected $gameId')
	const user = await assertAuthenticated(request)
	const game = await getGameId(params.gameId)
	const score = await getReviewByUserGame({
		gameId: params.gameId,
		userId: user.id,
	})
	const list = await getReviewsByGame({
		gameId: game.id,
	})

	return json({
		user,
		game,
		gameId: params.gameId,
		score: score?.value,
		review: score?.review,
		list,
	})
}

export async function action({
	params,
	request,
}: ActionFunctionArgs) {
	const user = await assertAuthenticated(request)
	invariant(params.gameId, 'Expected gameId')
	const formData = await request.formData()
	const formReview = formData.get('review') as string
	const formScore = formData.get('score') as string
	const fieldErrors: Record<
		'score' | 'review',
		string | null
	> = {score: null, review: null}
	if (typeof formReview !== 'string') {
		fieldErrors.review = 'Análise inválida'
	} else if (
		formReview.length <= 0 ||
		formReview.length > 400
	) {
		fieldErrors.review =
			'Tamanho da análise deve ter entre 1 e 400 caracteres'
	}
	if (typeof formScore !== 'string') {
		fieldErrors.score = 'Nota inválida'
	} else {
		const numScore = Number(formScore)
		if (isNaN(numScore)) {
			fieldErrors.score = 'Nota deve ser um número'
		} else if (numScore < 1 || numScore > 10) {
			fieldErrors.score = 'Nota deve ser entre 1 e 10'
		}
	}
	if (
		fieldErrors.review != null ||
		fieldErrors.score != null
	) {
		return json(
			{
				formFields: {score: formScore, review: formReview},
				fieldErrors,
			},
			{status: 422},
		)
	}

	const score = Number(formScore)
	const review = String(formReview)
	const result = await upsertReview({
		userId: user.id,
		gameId: params.gameId,
		review,
		value: score,
	})

	return redirect(
		`/user/${user.username}/review/${result.gameId}`,
	)
}

export default function GameReviewPage() {
	const loaderData = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()

	const [hover, setHover] = useState<number>()
	const [score, setScore] = useState<number>(
		(actionData?.formFields.score
			? Number(actionData?.formFields.score)
			: loaderData.score) ?? 0,
	)

	useEffect(() => {
		if (
			actionData?.formFields.score == null &&
			loaderData.score
		) {
			setScore(loaderData.score)
		}
	}, [actionData?.formFields.score, loaderData.score])

	const highlighted =
		typeof hover === 'number' ? hover : score ?? 0

	const id = useId()
	return (
		<div className='flex flex-col gap-6'>
			<Form
				className='px-6 flex flex-col items-stretch gap-2'
				method='POST'
			>
				<div className='flex flex-col sm:flex-row gap-6'>
					<div className='flex flex-col gap-2 flex-grow basis-0'>
						<Label htmlFor={`${id}score`}>Nota</Label>
						<RadioGroup.Root
							id={`${id}score`}
							name='score'
							value={String(score)}
							onValueChange={(value) => {
								setScore(Number(value))
							}}
						>
							<div className='grid grid-cols-5 gap-y-2 gap-x-0 sm:gap-x-2'>
								{Array.from({length: 10}).map((_, i) => (
									<RadioGroup.Item
										key={i}
										value={String(i + 1)}
										onMouseOver={() => {
											setHover(i + 1)
										}}
										onFocus={() => {
											setHover(i + 1)
										}}
										onMouseOut={() => {
											setHover(undefined)
										}}
										onBlur={() => {
											setHover(undefined)
										}}
									>
										<StarIcon
											className={cn(
												'mx-auto fill-muted stroke-muted-foreground',
												'hover:fill-yellow-400 hover:stroke-black',
												'dark:hover:fill-yellow-600 dark:hover:stroke-white',
												i < highlighted &&
													'fill-yellow-200 stroke-yellow-300 dark:fill-yellow-800 dark:stroke-yellow-700',
											)}
										/>
									</RadioGroup.Item>
								))}
							</div>
						</RadioGroup.Root>
						{actionData?.fieldErrors?.score && (
							<Alert variant='destructive'>
								{actionData?.fieldErrors?.score}
							</Alert>
						)}
					</div>
					<div className='flex-grow-[4] flex flex-col gap-2 basis-0'>
						<Label htmlFor={`${id}review`}>Análise</Label>
						<Textarea
							id={`${id}review`}
							name='review'
							defaultValue={
								actionData?.formFields.review ??
								loaderData.review ??
								undefined
							}
							maxLength={300}
						/>
						{actionData?.fieldErrors?.review && (
							<Alert variant='destructive'>
								{actionData?.fieldErrors?.review}
							</Alert>
						)}
					</div>
				</div>
				<Button type='submit' className='self-end'>
					Salvar
				</Button>
			</Form>
			<TooltipProvider>
				{loaderData.list.length > 0 && (
					<div className='mx-auto'>
						<ul className='mx-6 flex flex-col gap-12 max-w-[60ch]'>
							{loaderData.list.map((score) => (
								<li key={score.id}>
									<Quote
										quote={score.review}
										author={
											<div className='inline-flex gap-2'>
												<Link
													to={`/user/${score.user.username}`}
												>
													{score.user.name}
												</Link>
												<ScoreDisplay score={score.value} />
											</div>
										}
									/>
								</li>
							))}
						</ul>
					</div>
				)}
			</TooltipProvider>
		</div>
	)
}
