
const {StatusCodes} = require('http-status-codes')
const BookingService = require('../services/booking-service');


const bookingService = new BookingService();    
const {REMINDER_BINDING_KEY} = require('../config/serverConfig');
const {createChannel , publishMessage} = require('../utils/messageQueue');
class BookingController{
        
    async sendMessageToQueue(req , res){
        const channel = await createChannel();
        const payload = {
            data : {
                subject : 'This is noti from queue',
                content : 'todays msg are from here ',
                recepientEmail : 'hk8810254@gmail.com',
                notificationTime : '2023-07-02T19:22:37'
            },
            service : 'CREATE_TICKET'
        };

        publishMessage(channel , REMINDER_BINDING_KEY , JSON.stringify(payload));
        return res.status(StatusCodes.OK).json({
            message: 'Successfully Published message',
            
        })
    }
    async create(req, res){
        try {
            //console.log(typeof req.body.flightId);
            const response = await bookingService.createBooking(req.body);
            //console.log("FROM BOOKING CONTROLLER", response);
            return res.status(StatusCodes.OK).json({
                message: 'Successfully completed booking',
                success: true,
                err: {},
                data: response
            })
        } catch (error) {
            console.log("this is the error" , error.message);
            return res.status(error.statusCode).json({
                message: error.message,
                success: false,
                err: error.explanation,
                data: {}
            });
        }
    }

    
    async cancelBooking(req , res){
        try{
            console.log("request id is" , req.params.id);
            const response = await bookingService.cancel(req.params.id);
            console.log("request id is" , req.params.id);
            return res.status(StatusCodes.OK).json({
                message: 'Successfully cancelled the  booking',
                success: true,
                err: {},
                data: response
            })
        }
        catch{
            console.log('controller fault not able to cancel' , error);
            return res.status(error.statusCode).json({
                message: error.message,
                success: false,
                err: error.explanation,
                data: {}
            });
        }
    }
}

module.exports = BookingController