export interface InvestmentIncome {
    id: number;
    month_info_id: number;
    investment_income_type: "interest" | "dividend" | "capital_gain" | "rent" | "royalty";
    value: number;
    description: string;
    date: Date; // optional
    currency: string;
}
