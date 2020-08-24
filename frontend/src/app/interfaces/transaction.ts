export interface Transaction {
    id: number;
    transaction_type: 'income' | 'expenditure';
    value: number;
    date: Date;
    description: string
}
