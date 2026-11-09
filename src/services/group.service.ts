import { prisma } from "../lib/prisma";

// Create a group and add the logged-in user as its first member.
export const createNewGroup = async (name: string, userId: string) => {
  return await prisma.group.create({
    data: {
      name,
      createdBy: {
        connect: { id: userId },
      },
      members: {
        create: {
          user: {
            connect: { id: userId },
          },
        },
      },
    },
    include: {
      members: {
        select: {
          userId: true,
          joinedAt: true,
        },
      },
    },
  });
};

// Retrieve all groups that the authenticated user belongs to.
export const getUserGroups = async (userId: string) => {
  return await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      createdById: true,
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
