const { v4: uuidv4 } = require("uuid");
const dbConnection = require("../mysql")
const validator = require("../middleware/validation")

const sendFriendRequest = async function (req, res) {
    try {

        let body = req.body
        console.log(body)
 
        const friendshipId = uuidv4();
        if (!validator.isValidRequestBody(body)) {
            return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
        }

        const { requesterId, receiverId } = body

        if (!validator.isValid(requesterId)) {
            return res.status(400).send({ status: false, msg: 'Requester Id is required' })
        };
        // phone Number is Mandatory...
        if (!validator.isValid(receiverId)) {
            return res.status(400).send({ status: false, msg: 'Receiver Id is required' })
        };

        let filterBody = [ friendshipId, requesterId, receiverId ]

        const sql = `INSERT INTO friendships (friendship_id, requester_id, receiver_id) VALUES (?, ?, ?);`;

        dbConnection.query(sql, filterBody, (error, results) => {
            if (error) throw error;      
            res.status(201).send({ status: true, msg: "Friend request sent successfully" });
        });

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const friendRequestList = async function(req, res, next) {
    try {
        let userId = req.params.userId

        if (!validator.isValidUUID(userId)) {
            return res.status(400).send({ status: false, msg: "User Id is required" })
        };

        let userQuery = `SELECT users.name, friendships.friendship_id FROM users INNER JOIN friendships ON users.user_id = friendships.requester_id WHERE friendships.receiver_id = ? AND friendships.status = "pending"`;

        const friendRequestData = await new Promise((resolve, reject) => {
            dbConnection.query(userQuery, userId, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });
       
        if (!friendRequestData.length) {
            return res.status(404).send({ status: false, message: "No pending friend request" });
        }
        if (friendRequestData.length === 1) {
            return res.status(200).send({ status: true, message: "All pending friend request fetched successfully", data: friendRequestData[0] });
        } else {
            return res.status(200).send({ status: true, message: "All pending friend request fetched successfully", data: friendRequestData });
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const acceptFriendRequest = async function (req, res) {
    try {

        let body = req.body
        console.log(body)
  
        if (!validator.isValidRequestBody(body)) {
            return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
        }

        const { requesterId, receiverId } = body

        if (!validator.isValid(requesterId)) {
            return res.status(400).send({ status: false, msg: 'Requester Id is required' })
        };
        // phone Number is Mandatory...
        if (!validator.isValid(receiverId)) {
            return res.status(400).send({ status: false, msg: 'Receiver Id is required' })
        };

        let filterBody = [ requesterId ]

        const sql = `UPDATE friendships SET status = "accepted" WHERE requester_id = ?`;

        dbConnection.query(sql, filterBody, (error, results) => {
            if (error) throw error;      
            res.status(201).send({ status: true, msg: "Friend request accepted." });
        });

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const suggestFriendList = async function(req, res, next) {
    try {
        let userId = req.params.userId
        console.log(userId)

        if (!validator.isValidUUID(userId)) {
            return res.status(400).send({ status: false, msg: "User Id is required" })
        };

        let userQuery = `SELECT users.name
        FROM users
        INNER JOIN friendships ON users.user_id = friendships.receiver_id
        WHERE friendships.status = "accepted" 
            AND friendships.requester_id IN (
                SELECT friendships.requester_id
                FROM friendships
                WHERE friendships.status = "accepted" AND friendships.receiver_id = ?
            )
            AND users.user_id = ?`;

        const friendRequestData = await new Promise((resolve, reject) => {
            dbConnection.query(userQuery, [userId, userId], (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });
       
        if (!friendRequestData.length) {
            return res.status(404).send({ status: false, message: "No suggested friend request" });
        }
        if (friendRequestData.length === 1) {
            return res.status(200).send({ status: true, message: "All suggested friend request fetched successfully", data: friendRequestData[0] });
        } else {
            return res.status(200).send({ status: true, message: "All suggested friend request fetched successfully", data: friendRequestData });
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports = { sendFriendRequest, friendRequestList, acceptFriendRequest, suggestFriendList }