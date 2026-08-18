export type MoneyInput = string | number | { toString(): string };

/** Convert a decimal TL amount to integer kuruş to avoid float drift. */
export function toKurus(value: MoneyInput): number {
  const normalized = typeof value === "number" ? value.toFixed(2) : value.toString();
  const [lira, fraction = "0"] = normalized.split(".");
  const padded = (fraction + "00").slice(0, 2);
  const sign = lira.startsWith("-") ? -1 : 1;
  const absLira = lira.replace("-", "");
  return sign * (Number.parseInt(absLira || "0", 10) * 100 + Number.parseInt(padded, 10));
}

export function fromKurus(kurus: number): number {
  return kurus / 100;
}

export function addKurus(...values: number[]) {
  return values.reduce((sum, value) => sum + value, 0);
}

export function multiplyKurus(unitKurus: number, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Quantity must be a non-negative integer");
  }
  return unitKurus * quantity;
}

const tlFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatTL(value: MoneyInput) {
  const kurus = toKurus(value);
  return tlFormatter.format(fromKurus(kurus)).replace("TRY", "₺").trim();
}

export function formatTLFromKurus(kurus: number) {
  return formatTL(fromKurus(kurus));
}
