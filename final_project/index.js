const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))


function auth(req,res,next){
    const token = req.session.token || req.headers['authorization']?.split(' ')[1];

    if (!token){
        return res.status(401).json({message: "Unauthorized"});
    }

    jwt.verify(token, process.env.JWT_SECRET || "secret_key",(err,user)=>{
        if (err){
            return res.status(401).json({message: "Unauthorized"});
        }
        req.username = user.username;
        next();
});
}

 
const PORT = process.env.PORT || 5001;

app.use("/customer/auth/*", auth);
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});