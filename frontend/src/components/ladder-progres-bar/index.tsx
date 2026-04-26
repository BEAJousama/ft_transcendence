"use client";

const icons = [
	"beginner.svg",
	"amateur.svg",
	"semi_professional.svg",
	"professional.svg",
	"world_class.svg",
	"legendary.svg",
];

const LadderProgressBar = ({ rating }: { rating: number }) => {
	const progress = Math.min((rating / 10000) * 100, 100);
	return (
		<div className="relative hidden h-12 w-full max-w-5xl md:block">
			<div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex w-full items-center justify-between z-10">
				{icons.map((item, i) => (
					<img
						key={i}
						src={`/levels/${item}`}
						alt=""
						width={36}
						className={`transition-all duration-300 ${
							i * 20 > progress ? "grayscale-[70%] opacity-50" : "drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]"
						}`}
					/>
				))}
			</div>
			<div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 w-full rounded-full bg-secondary-800 border border-white/[0.06] overflow-hidden">
				<div
					className="h-3.5 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-500 ease-out"
					style={{ width: `${progress}%` }}
				/>
			</div>
		</div>
	);
};
export default LadderProgressBar;
