var jwt = require('jsonwebtoken');

const JWT_SECRET = "thisisjwtsecretline";

const fetchuser = (req, res, next) => {
    //entering auth token in thunderclient in header section to get information
    const token = req.header("auth-token");
    // if token is not valid display an arror
    if (!token) {
        res.status(401).send({ error: "please authenticate using a valid token" })
    }
    try {
        //verify the token and jwt secret and get data of user
        const data = jwt.verify(token, JWT_SECRET); 
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ error: "please authenticate using a valid token" })

    }
}

module.exports = fetchuser;