//as we create token in our in api in login but that generate token is just half of the authentication, 
//we also need to verify the token when a user makes another request.
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

//for that purpose wee need middleware

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization; //this read the token send by frontend 

    if (!authHeader?.startsWith("Bearer")) { //check the expected format
        return res.status(401).json({message: "Access denied. Token required"})     
    }
    //if the auth header have start with bearer token then, need to extract that token
    //so,

    //slice is used ot get specific portion of a string or an array without modifying original array or string


    //slice(startindex, endindex)
    //phase word = "hello"
    // word.slice(o,1) it just give output 1


    //as it has first bearer and token key
    //this slice remove that bearer
    const token = authHeader.slice(7) //remove the bearer and check the extracts token

    const secret = process.env.JWT_SECRET

    if (!secret) {
        console.error("JWT_SECRETE IS MISSING")
        return res.status(500).json({
            message: "Server Configuration error"
        })
    }
    try {
        //verify the token signature and expiration,
        //we need to verify token for another  login request for we need to decode and verify
        const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] }) as JwtPayload;
        //is jwt verifiy is in string
        //where does this user id come:
//         jwt.sign({ userId: user.id }, secret, {
//   expiresIn: "1h",
        // });
        //we generate this payload user id while creating jwt token in login
        //it comes in format:
//         {
//   userId: "288f9bd8-59a1-4db6-b0b0-eb61c41d18c9",
//   iat: 1793851461,
//   exp: 1793855061
        // }
        //for this propose we need to check user id as a string
        if (typeof decoded.userId !== "string") {
           return res.status(401).json({message: "Invalid token payload"})
        }

        //here the res.locals is express object that is used to store temporary information during the current request.\
//         res.locals = {
//   userId: "288f9bd8-59a1-4db6-b0b0-eb61c41d18c9"
// };

        //else store the authencated users
        res.locals.userId = decoded.userId;  // res local doesnot  have there own id, here we are adding new properties userId
        
        //continue to the next middleware or controller
        next(); //does this next means go to next function
    }
    catch (error) {
        console.log(error, "error")
        return res.status(401).json({message: "Invalid or expired token"})
    }

    
}


//basically flow is like first route then controller then send to service, but service simple password bcrypt and jwt token generation is not enough
//so need to authorization butting middlware which check the token and verify that token in another request