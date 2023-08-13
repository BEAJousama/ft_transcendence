import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";
import { Linkedin } from "lucide-react";
import { Instagram } from "lucide-react";
interface ContributorProps {
	name: string;
	role: string;
	image: string;
	linkedin?: string;
	github?: string;
	instagram?: string;
}

export default function Contributor({
	name,
	role,
	image,
	linkedin,
	github,
	instagram,
}: ContributorProps) {
	return (
		<div className="flex flex-col drop-shadow-md hover:drop-shadow-xl transition-all ease-in-out">
			<Image
				src={image}
				alt={name}
				width={400}
				height={400}
				className="rounded-2xl"
				loading="lazy"
			/>
			<div className="flex flex-col items-center justify-center text-center py-4 gap-1">
				<h1 className="text-gray-100 text-xl font-bold">{name}</h1>
				<p className="text-gray-300 font-light">{role}</p>
				<div
					className="flex items-center gap-4 opacity-70 hover:opacity-100
                                transition-opacity duration-300"
				>
					{linkedin && (
						<Link
							href={`https://linkedin.com/in/${linkedin}`}
							className="text-gray-300 hover:text-primary-400 transition"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Linkedin size={"20px"} />
						</Link>
					)}
					{github && (
						<Link
							href={`https://github.com/${github}`}
							className="text-gray-300 hover:text-primary-400 transition"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Github size={"20px"} />
						</Link>
					)}
					{instagram && (
						<Link
							href={`https://instagram.com/${instagram}`}
							className="text-gray-300 hover:text-primary-400 transition"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Instagram size={"20px"} />
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
