"use client";
import { ChatBanner, Input, Spinner, UserBanner } from "../../components";
import useSWR from "swr";
import { fetcher } from "../../context/app.context";
import Layout from "../layout/index";
import IUser from "../../interfaces/user";
import Link from "next/link";
import * as React from "react";
import { Search as SearchIcon } from "lucide-react";

const options = [
	{ value: "api/users", label: "Users" },
	{ value: `api/channels`, label: "Channels" },
];

export default function Search() {
	const [value, setValue] = React.useState<string>("");
	const [selected, setSelected] = React.useState<string>("api/users");
	const [filtred, setFiltred] = React.useState<IUser[]>();
	let { data: users, isLoading } = useSWR(selected, fetcher, {
		errorRetryCount: 0,
		timeout: 1000,
	});

	React.useEffect(() => {
		if (users && (filtred || !value)) {
			if (selected === "api/users")
				setFiltred(
					users.filter((item: IUser) =>
						item.fullname.toLowerCase().includes(value.toLowerCase())
					)
				);
			else if (selected === "api/channels") {
				setFiltred(
					users.filter((item: any) =>
						item.name.toLowerCase().includes(value.toLowerCase())
					)
				);
			}
		} else setFiltred(users);
	}, [value, users]);

	return (
		<Layout className="flex flex-col items-center gap-6 md:gap-8">
			<div className="w-full max-w-[760px] rounded-2xl border border-white/[0.06] bg-secondary-700 p-5 shadow-xl shadow-black/20 md:p-6">
				<div className="mb-5 flex items-center gap-3 text-secondary-50">
					<div className="ui-page-header-icon">
						<SearchIcon className="h-5 w-5" />
					</div>
					<div>
						<p className="ui-label">Discovery</p>
						<p className="text-base font-semibold tracking-tight md:text-lg">Search users and channels</p>
					</div>
				</div>
				<div className="flex flex-col sm:flex-row w-full items-center gap-2.5">
					<Input
						className="w-full"
						label="Search"
						placeholder="Search Users, Games, Channels ...."
						value={value}
						onChange={(e) => setValue(e.target.value)}
					/>
					<div className="w-full sm:w-[30%]">
						<Input
							className="px-2"
							type="select"
							value={selected}
							options={options}
							onChange={(e) => setSelected(e.target.value)}
						/>
					</div>
				</div>
				<div className="mt-5 flex w-full flex-col items-center justify-center gap-2">
					{isLoading ? (
						<Spinner />
					) : filtred?.length ? (
						filtred.map((item: any) => {
							return selected === "api/users" ? (
								<Link key={item.id} href={`/profile/${item.id}`} className="w-full">
									<UserBanner
										key={item.id}
										user={item}
										showRating
										rank={item.rating}
									/>
								</Link>
							) : (
								<ChatBanner key={item.id} channel={item} />
							);
						})
					) : (
						<div className="flex h-[280px] items-center justify-center text-lg text-secondary-300">
							No matches found
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
}
