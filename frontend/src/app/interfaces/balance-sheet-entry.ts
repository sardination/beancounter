export interface BalanceSheetEntry {
    id: number;
    entry_type: 'liquid_asset' | 'fixed_asset' | 'liability';
    value: number;
    description: string;
}
