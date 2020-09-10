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