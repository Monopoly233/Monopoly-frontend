// utils.js

export const formatBalance = (balance) => {
    const million = Math.floor(balance / 1_000_000);
    const thousand = Math.floor((balance % 1_000_000) / 1_000);
    let formattedBalance = '';
  
    if (million > 0) {
      formattedBalance += `${million}M`;
    }
    if (thousand > 0) {
      formattedBalance += `${thousand}K`;
    }
  
    return formattedBalance || '0';
  };
  