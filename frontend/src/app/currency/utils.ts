export const includedCurrencies = [
    {code: 'USD', symbol: '$'},
    {code: 'GBP', symbol: '£'},
    {code: 'INR', symbol: '₹'},
    {code: 'EUR', symbol: '€'}
]

export function getCurrencySymbol(currency: string): string {
    for (var i = 0; i < includedCurrencies.length; i++) {
      const currMap = includedCurrencies[i];
      if (currMap.code == currency) {
        return currMap.symbol
      }
    }
    return currency + " "
}

export function currencyIncluded(currency: string): boolean {
    for (var i = 0; i < includedCurrencies.length; i++) {
      const currMap = includedCurrencies[i];
      if (currMap.code == currency) {
        return true
      }
    }
    return false
}
