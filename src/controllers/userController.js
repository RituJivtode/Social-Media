const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const dbConnection = require("../mysql")
const validator = require("../middleware/validation")
const aws = require("../middleware/aws")

const registerUser = async function (req, res) {
    try {

        let body = req.body
        console.log(body)
 
        // Generate UUID for the user
        const userId = uuidv4();
        if (!validator.isValidRequestBody(body)) {
            return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
        }

        const { name, email, password, department, about, hobbies } = body

        if (!validator.isValid(name)) {
            return res.status(400).send({ status: false, msg: 'Name is required' })
        };
        // phone Number is Mandatory...
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, msg: 'Email is required' })
        };

        // For a Valid Email...
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: 'Email should be a valid' })
        };

        // Email is Unique...
        let checkUserQuery = `SELECT COUNT(*) AS count_exists
                      FROM users
                      WHERE email = ?`;

        const duplicateEmail = await new Promise((resolve, reject) => {
            dbConnection.query(checkUserQuery, email, (error, results) => {
                if (error) reject(error);
                else resolve(results[0].count_exists);
            });
        });

        if (duplicateEmail > 0) {
            return res.status(409).send({ status: false, msg: 'This email is used before for sign up, use different email' });
        }

        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        let passwordValue = await bcrypt.hash(password, salt);

         // Check if the profile picture field exists in the request body
        let image = req.files
        console.log(image)
        if (image && image.length > 0) {
            //upload filse in aws s3
            var userPhoto = await aws.uploadFile(image[0]);
            console.log(userPhoto)
        } else {
            return res.status(400).send({ msg: "No file found" })
        }

        if (!validator.isValid(name)) {
            return res.status(400).send({ status: false, msg: "Name is required" })
        };
        if (!validator.isValid(department)) {
            return res.status(400).send({ status: false, msg: "Department is required" })
        };
        // phone Number is Mandatory...
        if (!validator.isValid(about)) {
            return res.status(400).send({ status: false, msg: 'About is required' })
        };
        // Email is Mandatory...
        if (!validator.isValid(hobbies)) {
            return res.status(400).send({ status: false, msg: "Hobbies are required" })
        };

        let filterBody = [userId, name, email, passwordValue, userPhoto, department, about, hobbies, image]

        const sql = `INSERT INTO users (user_id, name, email, password, profile_picture, department, about, hobbies )
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        dbConnection.query(sql, filterBody, (error, results) => {
            if (error) throw error;
            const selectUserQuery = `SELECT * FROM users WHERE email = ?`;

            dbConnection.query(selectUserQuery, email, (error, userResults) => {
                if (error) throw error;
      
                const registeredUser = userResults[0];
            res.status(201).send({ status: true, msg: "User registered successfully", data: registeredUser });
            })
        });

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const login = async function(req, res, next) {
    try {

        let body = req.body

        if (!validator.isValidRequestBody(body)) {
            return res.status(400).send({ Status: false, message: "Please provide log in credentials" })
        }
        const { email, otp } = body
        console.log(email)

        const checkUser = req.checkUser;

        let passwordMatch = await bcrypt.compare(body.password, checkUser.password)
        if (!passwordMatch) {
            return res.status(401).send({ status: false, msg: "incorrect password" })
        }
        //******------------------- generating token for user -------------------****** //

        let userToken = jwt.sign({userId: checkUser.user_id}, process.env.JWT_SECRET); 

        return res.status(200).send({ status: true, message: "User login successfully", data: { userId: checkUser.user_id, authToken: userToken } });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const registeredUsersList = async function(req, res, next) {
    try {
        let userId = req.params.userId

        if (!validator.isValidUUID(userId)) {
            return res.status(400).send({ status: false, msg: "User Id is required" })
        };

        let userQuery = `SELECT *
        FROM users`;

        const userData = await new Promise((resolve, reject) => {
            dbConnection.query(userQuery, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });
       
        if (!userData.length) {
            return res.status(404).send({ status: false, message: "No appointments are scheduled for this date" });
        }
        if (userData.length === 1) {
            return res.status(200).send({ status: true, message: "All registered user fetched successfully", data: userData[0] });
        } else {
            return res.status(200).send({ status: true, message: "All registered user fetched successfully", data: userData });
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports = { registerUser, login, registeredUsersList }