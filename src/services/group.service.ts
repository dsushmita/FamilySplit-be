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

export const addGroupMember = async (
  groupId: string,
  email: string,
  currentUserId: string,
) => {
  //first we need to find the groups

  const group = await prisma.group.findUnique({ where: { id: groupId } });

  if (!group) {
    throw new Error("GROUP_NOT_FOUND");
  }

  //CHECK whether the logged in user create the group
  if (group.createdById !== currentUserId) {
    throw new Error("NOT_GROUP_CREATOR");
  }

  //Find the user we want to add .

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  
  if (!user) {
    throw new Error ("USER_NOT_FOUND")
  }

  //Check if the user is already a member
  const existingMember = await prisma.groupMember.findUnique({ where: { userId_groupId: { userId: user.id, groupId } } })
  if (existingMember) {
    throw new Error ("Already_member")
  }

  //create the membership
  return await prisma.groupMember.create({ data: { userId: user.id, groupId, }, include: { user: { select: { id: true, name: true, email:true}}} })
};
