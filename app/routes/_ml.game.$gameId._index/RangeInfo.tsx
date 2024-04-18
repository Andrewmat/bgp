export function RangeInfo({
	min,
	max,
	appendix,
}: {
	min: number
	max: number
	appendix: string
}) {
	return (
		<p>
			{min === max ? min : `${min} - ${max}`} {appendix}
		</p>
	)
}
