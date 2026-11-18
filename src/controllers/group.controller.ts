
import type { Request, Response } from "express";
import {
  addGroupMember,
  createNewGroup,
  getGroupMembers,
  getUserGroups,
} from "../services/group.service";

// Validate the group name and create a group for the authenticated user.
export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name } = req.body ?? {};
    const userId = res.locals.userId;

    if (typeof userId !== "string") {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Group name is required",
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        message: "Group name must be 100 characters or fewer",
      });
    }

    const group = await createNewGroup(name.trim(), userId);

    return res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    console.error("Create group error:", error);

    return res.status(500).json({
      message: "Failed to create group",
    });
  }
};

// Retrieve the authenticated user's groups.
export const getGroups = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;

    if (typeof userId !== "string") {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const groups = await getUserGroups(userId);

    return res.status(200).json({
      message: "Groups retrieved successfully",
      groups,
    });
  } catch (error) {
    console.error("Get groups error:", error);

    return res.status(500).json({
      message: "Failed to retrieve groups",
    });
  }
};

export const addMemberToGroup = async (req: Request, res: Response) => {
  try {
    //Logged-in user ID from JWT authentication. 
    const userId = res.locals.userId; //Your existing JWT authentication middleware sets this value after verifying the token.

    //Get group Id from URL and email from request body.
    const groupId = req.params.groupId; //Group ID from the API URL.
    const { email } = req.body ?? {}; //Email of the person you want to add.

    // POST http://localhost:3001/api/groups/550e8400-e29b-41d4-a716-446655440000/members

    // 3. Validate authentication.
    if (typeof userId !== "string") {
      return res.status(401).json({
        message: "Authentication required",
      });
    }
    // 4. Validate group ID.
    if (typeof groupId !== "string" || !groupId.trim()) {
      return res.status(400).json({
        message: "Group ID is required",
      });
    }

    // 5. Validate email.
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Member email is required",
      });
    }

    //call the service functions
    const member = await addGroupMember(
      groupId,
      email.trim().toLowerCase(),
      userId,
    );

    // 7. Return successful response.
    return res
      .status(201)
      .json({ message: "Member added successfully", member });
  } catch (error) {
    // 8. Handle known service errors.
    if (error instanceof Error) {
      switch (error.message?.toUpperCase()) {
        case "GROUP_NOT_FOUND":
          return res.status(404).json({ message: "Group not found" });

        case "NOT_GROUP_CREATOR":
          return res.status(403).json({ message: "Only the group creator can add members" });

        case "USER_NOT_FOUND":
          return res.status(404).json({ message: "User not found" });

        case "ALREADY_MEMBER":
          return res.status(409).json({ message: "User is already a group member" });
        default:
          return   res.status(409).json({ message: "Unknown error" });
      }
    }
  }
};


/**
 * POST /api/groups/abc123/members
 * URL
POST /api/groups/abc123/members


Headers
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json


Body
{
  "email": "bharat@example.com"
}


Your controller receives:
const userId = res.locals.userId;
const groupId = req.params.groupId;
const { email } = req.body ?? {};


Code	Example value	Where it comes from
res.locals.userId	"user-123"	JWT middleware
req.params.groupId	"abc123"	API URL
req.body.email	"bharat@example.com"	JSON request body
 */

/**
 * Most common HTTP status codes
These are important for frontend and backend development.
Status	Name	When to use
200	OK	Successfully retrieved data
201	Created	Successfully created a resource
204	No Content	Successful request with no response body
400	Bad Request	Invalid input or missing required data
401	Unauthorized	Missing or invalid authentication
403	Forbidden	Authenticated but not allowed
404	Not Found	Requested resource doesn't exist
409	Conflict	Resource already exists or conflicts
500	Internal Server Error	Unexpected backend error
 */

/**
 * req.params → Values in the URL path.
req.body → Data sent by the frontend.
req.headers → Metadata such as the JWT authorization header\
res.locals → Data shared by Express middleware with subsequent handlers.
 */



export const getMembers = async (req: Request, res: Response) => {
  try {
    // Get the logged-in user's ID from JWT middleware
    const userId = res.locals.userId;

    // Get the group ID from the URL
    const groupId = req.params.groupId;

    // Check authentication
    if (typeof userId !== "string") {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check group ID
    if (typeof groupId !== "string" || !groupId.trim()) {
      return res.status(400).json({
        message: "Group ID is required",
      });
    }

    // Call the service to retrieve group members
    const members = await getGroupMembers(groupId, userId);

    return res.status(200).json({
      message: "Group members retrieved successfully",
      members,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "GROUP_ACCESS_DENIED"
    ) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    console.error("Get group members error:", error);

    return res.status(500).json({
      message: "Failed to retrieve group members",
    });
  }
};
