
export type CategoryType = {
  id: string;
  name: string;
  subcategories: SubcategoryType[];
}

export type SubcategoryType = {
  id: string;
  name: string;
  budgeted: number;
  categoryId: string;
}

export type TransactionType = {
  id: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  subcategoryId: string | null;
  description: string;
}

export type MonthlyBudget = {
  month: string; // Format: YYYY-MM
  income: number;
  categories: CategoryType[];
}
