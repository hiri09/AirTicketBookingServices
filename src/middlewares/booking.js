//const {ClientErrorCodes , ServerErrorCodes ,SuccessCodes} = require('../utils/errors');
const {JWT_KEY , USER_SERVICE_PATH} = require('../config/serverConfig');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const ValidateUser = async(req,res,next)=>{
    
    if(!req.headers['x-access-token']){
        return res.status(400).json({
            data:{},
            message:"you have not provided the accese token",
            success:false,
            error:"sign in again and provide access token "
        });
    }
    try{
        const token = req.headers['x-access-token'];
        const response = jwt.verify(token , JWT_KEY);

        
        const fetchUserURL = `${USER_SERVICE_PATH}/api/v1/isUser/${response.id}`;
        //const user = await this.userRepository.getById(response.id);
        const user = await axios.get(fetchUserURL);
        next();
    }
    catch(error){
        
        console.log("invalid token");
        return res.status(400).json({
            message: "your token is either wrong or expired",
            success: false,
            err: "your token is either wrong or expired",
            data: {}
        });
    
    }
    
}

module.exports = {
    ValidateUser
}

