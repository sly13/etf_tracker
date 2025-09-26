const fs = require('fs');

let content = fs.readFileSync('src/api/telegram-bot/services/etf.service.ts', 'utf8');

// Replace all reduce calls with for loops
const fundsEth = ['Fidelity', 'Bitwise', 'TwentyOneShares', 'VanEck', 'Invesco', 'Franklin', 'Grayscale', 'GrayscaleCrypto'];
const fundsBtc = ['Blackrock', 'Fidelity', 'Bitwise', 'TwentyOneShares', 'VanEck', 'Invesco', 'Franklin', 'Valkyrie', 'WisdomTree', 'Grayscale', 'GrayscaleBtc'];

// Ethereum funds
fundsEth.forEach(fund => {
  const fieldName = fund.charAt(0).toLowerCase() + fund.slice(1);
  const pattern = new RegExp(`      const total${fund} = ethereumData\\.reduce\\([\\s\\S]*?\\);`, 'g');
  const replacement = `      let total${fund} = 0;
      for (const day of ethereumData) {
        total${fund} += Number(day.${fieldName} || 0);
      }`;
  content = content.replace(pattern, replacement);
});

// Bitcoin funds
fundsBtc.forEach(fund => {
  const fieldName = fund.charAt(0).toLowerCase() + fund.slice(1);
  const pattern = new RegExp(`      const total${fund} = bitcoinData\\.reduce\\([\\s\\S]*?\\);`, 'g');
  const replacement = `      let total${fund} = 0;
      for (const day of bitcoinData) {
        total${fund} += Number(day.${fieldName} || 0);
      }`;
  content = content.replace(pattern, replacement);
});

// Also replace totals in summary
content = content.replace(
  /const (sevenDayTotal|thirtyDayTotal) = (ethereumData|bitcoinData)\.reduce\(\s*\(sum, day\) => sum \+ Number\(day\.total \|\| 0\),\s*0 as any,\s*\);/g,
  (match, varName, dataName) => {
    return `let ${varName} = 0;
      for (const day of ${dataName}) {
        ${varName} += Number(day.total || 0);
      }`;
  }
);

// And in getSummaryData
content = content.replace(
  /(btcSevenDay|ethSevenDay)\.reduce\(\s*\(sum, day\) => sum \+ Number\(day\.total \|\| 0\),\s*0\s*\)/g,
  (match, arrayName) => {
    const dataName = arrayName === 'btcSevenDay' ? 'btcSevenDay' : 'ethSevenDay';
    return `(() => {
          let sum = 0;
          for (const day of ${dataName}) {
            sum += Number(day.total || 0);
          }
          return sum;
        })()`; 
  }
);

fs.writeFileSync('src/api/telegram-bot/services/etf.service.ts', content);
console.log('Replaced all reduce calls with for loops');
