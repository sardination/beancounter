export interface WeeklyJobTransaction {
    id: number;
    transaction_type: 'income' | 'expenditure';
    hours: number;
    value: number;
    description: string
}
