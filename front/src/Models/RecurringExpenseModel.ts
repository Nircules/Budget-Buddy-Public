class RecurringExpenseModel {
    public id: number;
    public user: number;
    public start_date: string;
    public end_date: string;
    public frequency: string;
    public description: string;
    public amount: number;
    public category: number;
    public is_active: boolean;
}

export default RecurringExpenseModel;