const express = require("express");
const router = express.Router(); //used express to create route handlers
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file

//import controllers
const userController = require("../controllers/userController");
const friendController = require("../controllers/friendController");
const auth = require('../middleware/auth')


//user signup 
router.post("/registerUser", userController.registerUser);
//user Login
router.post("/login", auth.authentication, userController.login);
//fetch registered user
router.get("/userList/:userId", auth.authorization, userController.registeredUsersList);
//send friend request
router.post("/send-friend-request", friendController.sendFriendRequest);
//fetch friend request
router.get("/listFriendRequests/:userId", friendController.friendRequestList);
//accept friend request
router.put("/accept-friend-request", friendController.acceptFriendRequest);
//suggested friend request
router.get("/suggestedFriends/:userId", friendController.suggestFriendList);

module.exports = router;
