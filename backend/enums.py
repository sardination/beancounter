import enum

class BalanceSheetEntryType(enum.Enum):
    liquid_asset = 1
    fixed_asset = 2
    liability = 3


class TransactionType(enum.Enum):
    income = 1
    expenditure = 2


class FulfilmentType(enum.Enum):
    positive = 1
    negative = 2
    neutral = 3


class InvestmentIncomeType(enum.Enum):
    interest = 1 # payment from fixed income investments (bonds, notes, CDs, savings account)
    dividend = 2 # share of profits paid out to you as owner of stocks, mutual funds, ETFs, or private corporations
    capital_gain = 3 # could also be capital loss, but just use negative value; from sale of investment/real estate different from amount originally invested
    rent = 4 # receiving rent from real estate holdings (minus expenses such as taxes, insurance, mortage, repairs, etc.)
    royalty = 5 # payment to you as owner of intellectual property, natural resources, franchises, etc. by their users