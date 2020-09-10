export interface MonthCategory {
    id: number;
    month_info_id: number;
    category_id: number;
    fulfilment: 'positive'|'negative'|'neutral';
}
