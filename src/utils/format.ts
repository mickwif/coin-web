const MaxLength = 12;

const formatNumberHelper = (value: string): string => {
  const numericValue = value.replace(/[^0-9.]/g, '');
  const [integerPart, decimalPart] = numericValue.split('.');
  const formattedIntegerPart = Number(integerPart).toLocaleString('en-US');

  if (decimalPart === undefined) return formattedIntegerPart;
  if (decimalPart === '') return `${formattedIntegerPart}.`;
  return `${formattedIntegerPart}.${decimalPart.slice(0, 2)}`;
};

export const formatNumber = (value: string): string => {
  const res = formatNumberHelper(value);
  
  const value_without_comma = res.replace(/,/g, '');
  if (value_without_comma.length >= MaxLength) {
    return formatNumberHelper(value_without_comma.slice(0, MaxLength));
  } else {
    return res;
  }
};

export const convertFormatNumberToNumber = (formattedNumber: string): number => {
  const numericValue = formattedNumber.replace(/,/g, '');
  return Number(numericValue);
};
