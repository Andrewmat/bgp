export function DrawingWrapper({
	drawing,
	text,
}: {
	drawing: string
	text: React.ReactNode
}) {
	return (
		<div className='w-full flex-grow mt-6 flex flex-col items-center gap-6 justify-center self-center'>
			<img className='h-[200px]' src={drawing} alt='' />

			<p className='max-w-prose font-bold text-large text-center text-pretty'>
				{text}
			</p>
		</div>
	)
}
