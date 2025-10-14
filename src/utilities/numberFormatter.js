export default function formatNumber(number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",

    maximumFractionDigits: 1,
  }).format(number);
}

// TODO: we can make here different type of currency
