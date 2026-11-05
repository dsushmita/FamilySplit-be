import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";

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

export const loginUser =  async (email:string, password: string) => {
    
    //here if email password cha vane login gar vanne 
    //but naya login garnu vanda agi ta tei same emailx a ki nai vanera find garnu parxa

   //here we check the if there is exisitng email or not
    const user = await prisma.user.findUnique({
        where :{email},
    })
//then after we check the user doesnot have password
    if (!user || !user.passwordHash) {
        return null
    }
// if password then we need to compare by using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
        return null
    }

    //after comparing password and everyvalidation we create login
    //first we create jwt secrete and then login
    
    const secret = process.env.JWT_SECRET;

    //if we dont secrete and we dont have defined in the env we need it should we should pass code and through error
    if (!secret) {
        throw new Error ("Jwt_secret is missing")
    } 

    //if we have screte key then we can generate token and send that token to frontend
    

    //here the sign function take paramater first is payload that u want to stored inside the token
    //the second paramater is secret which is private key used to sign the token
    //the third paramater that containe information like algorithms and expirations
    const token = jwt.sign({ userId: user.id },   secret, { algorithm: "HS256", expiresIn: "1h", })
    
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email:user.email
        }
    }



}