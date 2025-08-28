export interface YiqihuaInput {
  individuals: Array<{ name: string, amountSpent?: number, amountUnits?: number }>;
  decimals?: number; // number of decimal places, default 2 (e.g., cents)
};

export interface YiqihuaOutput {
  totalAmount: number;
  averageAmount: number;
  settlements: Array<{ from: string, to: string, amount: number }>;
};

export function yiqihua(input: YiqihuaInput): YiqihuaOutput {
  const individuals = input?.individuals ?? [];
  const decimals = input?.decimals !== undefined ? Math.max(0, Math.min(8, Math.floor(input.decimals))) : 2;
  const multiplier = Math.pow(10, decimals);
  const numberOfPeople = individuals.length;

  if (numberOfPeople === 0) {
    return {
      totalAmount: 0,
      averageAmount: 0,
      settlements: [],
    };
  }

  // Work in integer units (scaled by multiplier) to avoid floating-point errors
  const amountsInUnits = individuals.map((p) => {
    const hasUnits = p.amountUnits !== undefined;
    const hasSpent = p.amountSpent !== undefined;

    if (hasUnits === hasSpent) {
      throw new Error('Each individual must provide exactly one of amountUnits or amountSpent');
    }

    if (hasUnits) {
      const units = Number(p.amountUnits);
      if (!Number.isFinite(units) || Math.floor(units) !== units || units < 0) {
        throw new Error('amountUnits must be a non-negative integer');
      }
      return { name: p.name, units };
    }

    const spent = Number(p.amountSpent);
    if (!Number.isFinite(spent) || spent < 0) {
      throw new Error('amountSpent must be a non-negative finite number');
    }
    return { name: p.name, units: Math.round(spent * multiplier) };
  });

  const totalUnits = amountsInUnits.reduce((sum, p) => sum + p.units, 0);
  const averageUnitsFloor = Math.floor(totalUnits / numberOfPeople);
  const remainder = totalUnits % numberOfPeople; // number of people that should pay one extra unit

  // Assign the +1 unit share to those who spent the most to reduce transfers
  const bySpentDesc = [...amountsInUnits].sort((a, b) => b.units - a.units);
  const namesWhoPayExtraUnit = new Set(bySpentDesc.slice(0, remainder).map((p) => p.name));

  type Party = { name: string; amount: number };
  const creditors: Party[] = [];
  const debtors: Party[] = [];

  for (const { name, units } of amountsInUnits) {
    const share = averageUnitsFloor + (namesWhoPayExtraUnit.has(name) ? 1 : 0);
    const balanceUnits = units - share;
    if (balanceUnits > 0) {
      creditors.push({ name, amount: balanceUnits });
    } else if (balanceUnits < 0) {
      debtors.push({ name, amount: -balanceUnits });
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

    const transferUnits = Math.min(creditor.amount, debtor.amount);
    if (transferUnits > 0) {
      settlements.push({ from: debtor.name, to: creditor.name, amount: transferUnits / multiplier });
      creditor.amount -= transferUnits;
      debtor.amount -= transferUnits;
    }

    if (creditor.amount === 0) {
      creditorIndex += 1;
    }
    if (debtor.amount === 0) {
      debtorIndex += 1;
    }
  }

  return {
    totalAmount: totalUnits / multiplier,
    averageAmount: totalUnits / multiplier / numberOfPeople,
    settlements,
  };
}
