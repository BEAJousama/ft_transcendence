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
                "US",
                "TR",
                "TH",
                "SG",
                "RU",
                "PT",
                "NL",
                "MY",
                "MA",
                "LU",
                "KR",
                "JP",
                "IT",
                "JO",
                "GB",
                "FR",
                "FI",
                "ES",
                "DE",
                "CZ",
                "CH",
                "BE",
                "AU",
                "AT",
                "AE",
                "AM",
            ]}
            selected={selected}
            onSelect={onSelect}
        />
    );
};

export default FlagsSelect;