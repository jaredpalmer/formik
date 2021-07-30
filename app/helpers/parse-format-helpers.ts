export const parseNumberOrEmpty = (value: unknown) => {
    return value === "" || typeof value !== 'string'
        ? ""
        : parseInt(value.replaceAll(",", ""), 10);
}

export const formatNumberOrEmpty = (value: number | '') =>
    typeof value === "number"
        ? value.toLocaleString()
        : "";

const US_PHONE_PARTS_MATCH = /(1)?(\d{0,3})(\d{0,3})(\d{0,4})/;
const US_PHONE_FULL_MATCH = /(1)?(\d{3})(\d{3})(\d{4})/;

export const parsePhoneOrEmpty = (value: unknown) => {
    let result = "";

    if (typeof value === 'string') {
        const parts = value.replace(/\D/g, "").match(US_PHONE_PARTS_MATCH);

        if (parts) {
            result = parts.slice(1) // remove "full result"
                .filter(p => !!p) // remove empty items
                .join("-");
        }
    }

    return result;
}

export const validatePhone = (value: string, required = false) =>
    required && !value
        ? "Enter a U.S. phone number."
        : !required && !value
            ? ""
            : !value.replace(/\D/g, "").match(US_PHONE_FULL_MATCH)
                ? "Enter a valid U.S. phone number."
                : "";
