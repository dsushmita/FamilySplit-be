import { prisma } from "../lib/prisma"

export const getAllUsers = async () => {
    return await prisma.user.findMany()
}

export const createNewUser = async (name:string, email:string) => {
    return await prisma.user.create({
        data: {
            name,
            email
        }
    })
}