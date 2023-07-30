import ReactFlagsSelect from "react-flags-select";

const FlagsSelect = ({
    selected,
    onSelect,
}: {
    selected: string;
    onSelect: (code: string) => void;
}) => {
    return (
        <ReactFlagsSelect
            className="!m-0 w-full rounded-md border-2 border-quaternary-200 !p-0 font-semibold text-black"
            searchable
            countries={[
                "AM",
				"AU",
				"AT",
				"BE",
				"CZ",
				"FI",
				"FR",
				"DE",
				"IT",
				"JP",
				"JO",
				"LU",
				"MY",
				"MA",
				"NL",
				"PT",
				"RU",
				"SG",
				"KR",
				"ES",
				"CH",
				"TH",
				"TR",
				"AE",
				"GB",
				"US"
            ]}
            selected={selected}
            onSelect={onSelect}
        />
    );
};

export default FlagsSelect;