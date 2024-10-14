// import { body } from "express-validator";
// import prisma from "../DB/db.config.js";
// import fileType from "fileType";
import { PrismaClient, Role } from "@prisma/client";
import { fileTypeFromBuffer } from "file-type";
const prisma = new PrismaClient();

export const accessChat = async (req, res, next) => {
  try {
    let folder = "uploads/others";
    const fileTypeResult = await fileTypeFromBuffer(file.buffer);
    if (fileTypeResult) {
      if (fileTypeResult.mime.startsWith("image/")) {
        folder = "uploads/images";
      } else if (fileTypeResult.mime.startsWith("video/")) {
        folder = "uploads/videos";
      } else if (
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(fileTypeResult.mime)
      ) {
        folder = "uploads/docs";
      }
    }
    const savedFilePath = await saveFile(file, folder);
    res
      .status(200)
      .send({ message: "File uploaded successfully", path: savedFilePath });
    const { receiverId, content } = req.body;
    console.log("req.file:", req.body);

    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ message: "Receiver ID and content are required" });
    }
    const existingChat = await prisma.chat.findFirst({
      where: {
        // AND: [{ userId: senderId }, { receiverId: receiverId }],
        AND: [{ senderId: req.userId }, { receiverId: receiverId }],
      },
    });
    if (existingChat) {
      const newMessage = await prisma.chat.create({
        data: {
          content: content,
          senderId: req.userId,
          path: savedFilePath,
          receiverId,
        },
      });
      res.status(201).json(newMessage);
    } else {
      const newChat = await prisma.chat.create({
        data: {
          content: content,
          senderId: req.userId,
          receiverId: receiverId,
          path: savedFilePath,
        },
      });
      return res.status(201).json(newChat);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};
export const fetchChats = async (req, res, next) => {
  try {
    const authUser = req.userId;
    console.log(authUser);
    // Fetch all chats where the authUser is the sender or the receiver
    const fetchAllChats = await prisma.chat.findMany({
      where: {
        OR: [{ senderId: authUser }, { receiverId: authUser }],
      },
      include: {
        GroupChat: {
          include: {
            group: {
              include: {
                GroupMember: {
                  include: {
                    user: {
                      select: { name: true, photo: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Check if no chats were found
    if (fetchAllChats.length === 0) {
      return res.status(404).json({ message: "No chats found for the user" });
    }

    // Process chats to include relevant information
    const formattedChats = fetchAllChats.map((chat) => {
      if (chat.GroupChat) {
        return {
          ...chat,
          groupName: chat.GroupChat.group.groupName,
          groupMembers: chat.GroupChat.group.GroupMember.map((member) => ({
            userId: member.user.id,
            username: member.user.username, // Assuming your user model has a username field
            email: member.user.email, // Assuming your user model has an email field
          })),
        };
      }
      return chat;
    });

    res.json({ chats: formattedChats });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
export const createGroup = async (req, res, next) => {
  const ownerId = req.userId;
  const { groupName, users, content } = req.body;
  if (!Array.isArray(users) || users.length < 1) {
    return res.status(400).json({
      message: "At least one user must be in Group!...",
    });
  } else if (!groupName) {
    return res.status(400).json({
      message: "Group name is required!...",
    });
  }
  //check owner cannot create group with himSelf, at least One user is required
  if (users.includes(ownerId)) {
    return res.status(400).json({
      message: "You cannot create a group with yourself!...",
    });
  }
  const checkGroup = await prisma.group.findFirst({
    where: { groupName },
  });
  if (checkGroup) {
    return res.status(400).json({
      message:
        "Group name already taken. Please use a unique name for the group.",
    });
  }
  try {
    const groupChat = await prisma.group.create({
      data: {
        groupName,
        ownerId,
        GroupMember: {
          create: [
            {
              User: { connect: { id: ownerId } },
              role: Role.ADMIN,
            },
            ...users.map((userId) => ({
              User: { connect: { id: userId } },
            })),
          ],
        },
        groupChats: {
          create: users.map((rid) => ({
            chat: {
              create: {
                content,
                senderId: ownerId,
                receiverId: rid,
              },
            },
          })),
        },
      },
    });
    res.status(201).json({ groupChat });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the group.",
    });
    next(error);
  }
};
export const renameGroup = async (req, res, next) => {
  const userId = req.userId;
  const { groupId, groupName } = req.body;

  // Validate inputs
  if (!groupId || !groupName) {
    return res
      .status(400)
      .json({ message: "Group ID and new group name are required." });
  }

  try {
    // Check if the user is a member of the group
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        userId,
        groupId,
      },
    });

    if (!groupMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group." });
    }

    // Update the group name
    const updatedGroup = await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        groupName,
      },
    });
    // If update was successful, return a success response
    res
      .status(200)
      .json({ message: "Group name updated successfully.", updatedGroup });
  } catch (error) {
    console.error("Error updating group name:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the group name." });
    next(error);
  }
};
export const removeUser = async (req, res, next) => {
  const ownerId = req.userId;
  const { groupId, removeUserId } = req.body;
  if (!groupId && !removeUserId) {
    return res
      .status(400)
      .json({ message: "Both groupId and removeUserId are required." });
  }
  if (!groupId) {
    return res.status(400).json({ message: "groupId is required." });
  }
  if (!removeUserId) {
    return res.status(400).json({ message: "removeUserId is required." });
  }
  try {
    const totalUsersInGroup = await prisma.groupMember.count({
      where: {
        groupId: groupId,
      },
    });
    if (totalUsersInGroup <= 2) {
      return res.status(400).json({
        message:
          "You need at least 3 members in the group to remove a user.If you really want to Delete you need to delete this Group",
      });
    }
    const checkGroupMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: removeUserId,
      },
    });
    if (!checkGroupMember) {
      return res
        .status(400)
        .json({ message: "User is not a member of the group." });
    }
    const ownerGroupMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: ownerId,
      },
      select: {
        role: true, // Only select the role field
      },
    });
    const ownerRole = ownerGroupMember.role;
    if (ownerRole !== "ADMIN") {
      return res.status(403).json({
        message: "You do not have permission to remove users from the group.",
      });
    }
    await prisma.groupMember.deleteMany({
      where: {
        groupId,
        userId: removeUserId,
      },
    });
    res.status(200).json({ message: "User removed from group successfully." });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while removing the user from the group.",
    });
    next(error);
  }
};
export const deleteGroup = async (req, res, next) => {
  const ownerId = req.userId;
  const { groupId } = req.body;
  if (!groupId) {
    return res.status(400).json({ message: "groupId is required." });
  }
  try {
    const findGroup = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: ownerId,
      },
      select: {
        role: true,
      },
    });
    const authRole = findGroup.role;
    if (authRole !== "ADMIN") {
      return res.status(403).json({
        message: "You do not have permission to Delete the group.",
      });
    }
    await prisma.groupMember.deleteMany({
      where: {
        groupId,
      },
    });
    res.status(200).json({ message: "The group has Deleted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while Deleting the group.",
    });
    next(error);
  }
};
export const addUserToGroup = async (req, res, next) => {
  const owner = req.userId;
  const { userId, groupId } = req.body;
  if (!userId || !groupId) {
    return res.status(400).json({
      message: !userId
        ? "UserId is required to add into Group!..."
        : "GroupId is required to add into Group!...",
    });
  }
  try {
    const checkGroupMember = await prisma.groupMember.findFirst({
      where: {
        userId,
        groupId,
      },
    });
    if (checkGroupMember) {
      return res.status(400).json({
        message: "UserId is already Member of Group!...",
      });
    }
    const findRole = await prisma.groupMember.findFirst({
      where: {
        userId: owner,
      },
      select: {
        role: true,
      },
    });
    const authRole = findRole.role;
    if (authRole !== "ADMIN") {
      return res.status(403).json({
        message: "You do not have permission to Add users into group.",
      });
    }
    await prisma.groupMember.createMany({
      data: {
        groupId,
        userId,
      },
    });
    res.status(200).json({ message: "The User is add to Group successfully." });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while Updating the group.",
    });
    next(error);
  }
};
