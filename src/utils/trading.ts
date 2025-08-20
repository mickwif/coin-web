export const formatAmount = (amount: number, decimals: number) => {
  return amount / 10 ** decimals;
};

export const parseAmount = (input: string, decimals: number) => {
  return Math.round(parseFloat(input) * 10 ** decimals);
}; 

export const sleep = async (time: number) =>{
  return new Promise(resolve => setTimeout(resolve, time));
}