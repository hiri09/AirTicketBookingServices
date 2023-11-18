//const {ClientErrorCodes , ServerErrorCodes ,SuccessCodes} = require('../utils/errors');

const validateUpdateBooking = (req,res,next)=>{
   
    if(
        !req.body.flightId ||
        !req.body.noOfSeats
    ){
        return res.status(400).json({
            data:{},
            success:false,
            message:"Invalid request body for create flight",
            err:"Missing mandatory properties to create a flight"
        });
    }

    next();
}

module.exports = {
    validateUpdateBooking
}