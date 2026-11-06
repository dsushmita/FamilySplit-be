import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware"

const router = Router()
// Match the profile route, verify the JWT through middleware, then send the response if authentication succeeds.
//this get has 3 parameter, first is /profile as ulr path, and authenticate is middleware function that veifiy the jwt
//and the third paramater is req and res router handler function that send a request
router.get("/profile", authenticate, (req, res) => {
    return res.status(200).json({ message: "You are authenticated", userId: res.locals.userId, });
});

export default router

//how above get function worked
//first it goes to profile page and then goes to authtictae and veifity the jwt toiken and then it comes and send a response

/**
 * The frontend sends a GET /api/profile request.
Express matches the /profile route.
The authenticate middleware verifies the JWT.
If the token is valid, next() executes the profile handler.
The profile handler sends the HTTP response.
If the token is invalid, the middleware returns 401 Unauthorized without executing the profile handler.
 */