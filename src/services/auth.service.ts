import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

export const registerUser = async (name: string, email: string, password: string) => {
    
    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash
        },
        select: { //this tell prisma which fields to return as we exclude the passwordHash
            id: true,
            name: true,
            email: true,
            createdAt:true
        }
    });
    return user;
}