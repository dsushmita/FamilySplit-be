

/**
 * EXPENSE SERVICE
 * ---------------
 * The service layer talks to the database (through Prisma).
 * The controller validates the request, then calls these functions.
 *
 * Flow:  route -> authenticate middleware -> controller -> service (this file) -> database
 *
 * MONEY RULE:
 * We never do math with decimal numbers like 10.10 + 20.20 in JavaScript,
 * because floating point gives wrong answers (0.1 + 0.2 = 0.30000000000000004).
 * Instead we convert money to CENTS (whole numbers), do the math, and convert back.
 *   "100.50"  -> 10050 cents
 *   10050     -> "100.50"
 */

// Largest value that fits in the database column Decimal(12, 2) -> 9,999,999,999.99
const MAX_AMOUNT_CENTS = 999_999_999_999;

// ---------------------------------------------------------------------------
// Helper functions (used only inside this file)
// ---------------------------------------------------------------------------

// Convert user input like "100.50" or 100.5 into cents (10050).
// Throws INVALID_AMOUNT if the value is not a positive amount with max 2 decimals.
const toCents = (amount: string | number): number => {
  const value = String(amount).trim();

  // Allow only digits with an optional 1-2 digit decimal part. e.g. "10", "10.5", "10.50"
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    throw new Error("INVALID_AMOUNT");
  }

  const [whole, fraction = ""] = value.split(".");
  // padEnd makes "5" -> "50" so "10.5" becomes 1050 cents, not 1005
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

  if (cents <= 0 || cents > MAX_AMOUNT_CENTS) {
    throw new Error("INVALID_AMOUNT");
  }

  return cents;
};

// Convert cents (10050) back into a decimal string ("100.50") for the database / response.
const fromCents = (cents: number): string => {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
};

// Convert a Prisma Decimal value (from the database) into cents.
// Prisma returns Decimal objects, so we read them as strings first.
const decimalToCents = (value: { toString(): string }): number => {
  const [whole, fraction = ""] = value.toString().split(".");
  const negative = whole.startsWith("-");
  const cents = Math.abs(Number(whole)) * 100 + Number(fraction.padEnd(2, "0").slice(0, 2));
  return negative ? -cents : cents;
};

// Make sure the logged-in user belongs to the group.
// Every expense function uses this, so a stranger can't read or add expenses.
const ensureGroupMember = async (groupId: string, userId: string) => {
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } }, // uses @@unique([userId, groupId]) from the schema
  });

  if (!membership) {
    throw new Error("GROUP_ACCESS_DENIED");
  }
};

// Split the total equally between people, in cents.
// If it doesn't divide evenly, the leftover cents go to the first people.
// Example: 1000 cents between 3 people -> [334, 333, 333]  (total is still 1000)
const splitEqually = (totalCents: number, userIds: string[]) => {
  const share = Math.floor(totalCents / userIds.length);
  const remainder = totalCents % userIds.length;

  return userIds.map((userId, index) => ({
    userId,
    cents: share + (index < remainder ? 1 : 0),
  }));
};

// What we send back to the frontend for each expense (no passwordHash etc).
const expenseSelect = {
  id: true,
  description: true,
  amount: true,
  createdAt: true,
  groupId: true,
  paidBy: { select: { id: true, name: true, email: true } },
  splits: {
    select: {
      id: true,
      amount: true,
      user: { select: { id: true, name: true, email: true } },
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Service functions (exported, used by the controller)
// ---------------------------------------------------------------------------

export type CreateExpenseInput = {
  groupId: string;
  currentUserId: string; // logged-in user (from JWT, res.locals.userId)
  description: string;
  amount: string | number; // e.g. "1200.50"
  paidById?: string; // who paid; defaults to the logged-in user
  splitBetween?: string[]; // user IDs who share the cost; defaults to every group member
};

// Get all expenses of a group, newest first.
export const getGroupExpenses = async (groupId: string, userId: string) => {
  await ensureGroupMember(groupId, userId);

  return await prisma.expense.findMany({
    where: { groupId },
    select: expenseSelect,
    orderBy: { createdAt: "desc" },
  });
};

// Get one expense by its ID (only if the user is in that expense's group).
export const getExpenseById = async (expenseId: string, userId: string) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    select: expenseSelect,
  });

  if (!expense) {
    throw new Error("EXPENSE_NOT_FOUND");
  }

  await ensureGroupMember(expense.groupId, userId);

  return expense;
};

// Delete an expense. Only the person who paid it can delete it.
// Its splits are deleted automatically because of onDelete: Cascade in the schema.
export const deleteExpense = async (expenseId: string, userId: string) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    select: { id: true, paidById: true },
  });

  if (!expense) {
    throw new Error("EXPENSE_NOT_FOUND");
  }

  if (expense.paidById !== userId) {
    throw new Error("NOT_EXPENSE_PAYER");
  }

  await prisma.expense.delete({ where: { id: expenseId } });
};

/**
 * Work out how much each member is owed or owes in a group.
 *
 *   balance = (total this person PAID) - (total of this person's SHARES)
 *
 *   positive balance -> others owe this person money
 *   negative balance -> this person owes money
 *   zero             -> settled
 *
 * Example: Ram pays 300 for dinner split between Ram, Sita, Hari (100 each)
 *   Ram:  paid 300 - share 100 = +200  (gets 200 back)
 *   Sita: paid 0   - share 100 = -100  (owes 100)
 *   Hari: paid 0   - share 100 = -100  (owes 100)
 */
export const getGroupBalances = async (groupId: string, userId: string) => {
  await ensureGroupMember(groupId, userId);

  // Load members and all expenses (with splits) of the group.
  const [members, expenses] = await Promise.all([
    prisma.groupMember.findMany({
      where: { groupId },
      select: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.expense.findMany({
      where: { groupId },
      select: {
        amount: true,
        paidById: true,
        splits: { select: { userId: true, amount: true } },
      },
    }),
  ]);

  // Map of userId -> { paid, owed } in cents. Start everyone at 0.
  const totals = new Map<string, { paid: number; owed: number }>();
  for (const member of members) {
    totals.set(member.user.id, { paid: 0, owed: 0 });
  }

  // Add up what each person paid and what each person's share was.
  // (?? handles a user who has expenses but already left the group.)
  for (const expense of expenses) {
    const payer = totals.get(expense.paidById) ?? { paid: 0, owed: 0 };
    payer.paid += decimalToCents(expense.amount);
    totals.set(expense.paidById, payer);

    for (const split of expense.splits) {
      const person = totals.get(split.userId) ?? { paid: 0, owed: 0 };
      person.owed += decimalToCents(split.amount);
      totals.set(split.userId, person);
    }
  }

  // Build the response. Amounts go back as strings like "200.00".
  return members.map(({ user }) => {
    const { paid, owed } = totals.get(user.id) ?? { paid: 0, owed: 0 };
    return {
      user,
      totalPaid: fromCents(paid),
      totalShare: fromCents(owed),
      balance: fromCents(paid - owed),
    };
  });
};

import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

export const createExpense = async (
  groupId: string,
  paidById: string,
  description: string,
  amount: number,
  currentUserId: string
) => {
  // 1. Check whether the group exists
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: true,
    },
  });

  if (!group) {
    throw new Error("GROUP_NOT_FOUND");
  }

  // 2. Check whether the logged-in user belongs to the group
  const isMember = group.members.some(
    (member) => member.userId === currentUserId
  );

  if (!isMember) {
    throw new Error("NOT_GROUP_MEMBER");
  }

  // 3. Check whether the payer belongs to the group
  const isPayerMember = group.members.some(
    (member) => member.userId === paidById
  );

  if (!isPayerMember) {
    throw new Error("PAYER_NOT_GROUP_MEMBER");
  }

  // 4. Validate description
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("INVALID_DESCRIPTION");
  }

  // 5. Validate amount
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isSafeInteger(Math.round(amount * 100)) ||
    Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-7
  ) {
    throw new Error("INVALID_AMOUNT");
  }

  // Convert dollars into cents
  const totalCents = Math.round(amount * 100);

  const memberCount = group.members.length;

  if (memberCount === 0) {
    throw new Error("NO_GROUP_MEMBERS");
  }

  // 6. Calculate equal shares in cents
  const baseShare = Math.floor(totalCents / memberCount);
  const remainder = totalCents % memberCount;

  // Sort members to make remainder distribution consistent
  const members = [...group.members].sort((a, b) =>
    a.userId.localeCompare(b.userId)
  );

  const splits = members.map((member, index) => {
    const shareCents = baseShare + (index < remainder ? 1 : 0);

    return {
      userId: member.userId,
      amount: new Prisma.Decimal(shareCents).div(100),
    };
  });

  // 7. Save expense and splits in one database operation
  const expense = await prisma.expense.create({
    data: {
      description: description.trim(),
      amount: new Prisma.Decimal(totalCents).div(100),
      groupId,
      paidById,
      splits: {
        create: splits,
      },
    },
    include: {
      paidBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      splits: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return expense;
};
