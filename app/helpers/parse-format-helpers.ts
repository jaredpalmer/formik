export const parseNumberOrEmpty = (value: unknown) => {
    return value === "" || typeof value !== 'string'
        ? ""
        : parseInt(value.replaceAll(",", ""), 10);
}

export const formatNumberOrEmpty = (value: number | '') =>
    typeof value === "number"
        ? value.toLocaleString()
        : "";
