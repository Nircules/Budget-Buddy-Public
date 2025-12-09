class ExpenseModel {
	public id: number;
	public user: number;
	public pay_date: string;
	public description: string;
	public amount: number;
	public category: number;
	public budget?: number | null;
}

export default ExpenseModel;
