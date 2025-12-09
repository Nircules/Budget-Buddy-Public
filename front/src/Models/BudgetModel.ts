class BudgetModel {
	public id?: number;
	public user: number;
	public name: string;
	public amount: number;
	public remaining_amount: number;

	public constructor(
		id: number = 0,
		user: number,
		name: string = "",
		amount: number = 0,
		remaining_amount: number = 0
	) {
		this.id = id;
		this.user = user;
		this.name = name;
		this.amount = amount;
		this.remaining_amount = remaining_amount;
	}
}

export default BudgetModel;
