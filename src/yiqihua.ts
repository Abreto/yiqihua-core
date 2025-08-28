export interface YiqihuaInput {
  individuals: Array<{ name: string, amountSpent: number }>;
};

export interface YiqihuaOutput {
  totalAmount: number;
  averageAmount: number;
  settlements: Array<{ from: string, to: string, amount: number }>;
};

export function yiqihua(input: YiqihuaInput): YiqihuaOutput {
  const individuals = input?.individuals ?? [];
  const numberOfPeople = individuals.length;

  if (numberOfPeople === 0) {
    return {
      totalAmount: 0,
      averageAmount: 0,
      settlements: [],
    };
  }

  const totalAmount = individuals.reduce((sum, person) => sum + (Number.isFinite(person.amountSpent) ? person.amountSpent : 0), 0);
  const averageAmount = totalAmount / numberOfPeople;

  const epsilon = 1e-9;

  type Party = { name: string; amount: number };
  const creditors: Party[] = [];
  const debtors: Party[] = [];

  for (const person of individuals) {
    const balance = person.amountSpent - averageAmount;
    if (balance > epsilon) {
      creditors.push({ name: person.name, amount: balance });
    } else if (balance < -epsilon) {
      debtors.push({ name: person.name, amount: -balance });
    }
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements: Array<{ from: string; to: string; amount: number }> = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const transferAmount = Math.min(creditor.amount, debtor.amount);

    if (transferAmount > epsilon) {
      settlements.push({ from: debtor.name, to: creditor.name, amount: transferAmount });
      creditor.amount -= transferAmount;
      debtor.amount -= transferAmount;
    }

    if (creditor.amount <= epsilon) {
      creditorIndex += 1;
    }
    if (debtor.amount <= epsilon) {
      debtorIndex += 1;
    }
  }

  return {
    totalAmount,
    averageAmount,
    settlements,
  };
}
