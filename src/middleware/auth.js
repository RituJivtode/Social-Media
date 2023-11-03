const jwt = require("jsonwebtoken");
const dbConnection = require("../mysql")
const validator = require("../middleware/validation");
// const multer = require('multer');
// const upload = multer(); // Initialize multer

// app.use(upload.none()); // Use multer to parse form data


const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const authentication = async function (req, res, next) {
    try {
        let email = req.body.email
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, msg: "Email is required" })
        };

        // For a Valid Email...
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: ' Email should be a valid' })
        };

        //******------------------- checking User Detail -------------------****** //

        let checkUserQuery = `SELECT *
        FROM users
        WHERE email = ?`;

        const checkUser = await new Promise((resolve, reject) => {
            const query = dbConnection.query(checkUserQuery, email, (error, results) => {
                if (error) reject(error);
                else resolve(results[0]);
            });
        });
        console.log(checkUser)

        if (!checkUser) {
            return res.status(401).send({ Status: false, message: "Authentication failed: Invalid email" });
        }

        req.checkUser = checkUser;
        next();
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const authorization = async function (req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token not provided' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }

            req.user = decodedToken;

            // Extract hospital_id from the request body
            const userId = req.query.userId || req.params.userId;
       
            // Check if the hospital_id in the token matches the requested hospital_id
            if (userId !== decodedToken.userId) {
                return res.status(403).json({ message: 'Access denied' });
            }

            next();
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { authentication, authorization }