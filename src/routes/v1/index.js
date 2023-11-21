const express = require('express');

const BookingController = require('../../controllers/booking-controller');
//const {createChannel} = require('../../utils/messageQueue');
//const channel = await createChannel();
const bookingController = new BookingController();
const {BookingMiddlewares} = require('../../middlewares/index');

const router = express.Router();

router.get('/info' , (req , res)=>{
    return res.json({message : 'Response from the router'});
})

router.post('/bookings' ,BookingMiddlewares.ValidateUser , bookingController.create);

router.patch('/Cancelbookings/:id' , BookingMiddlewares.ValidateUser ,  bookingController.cancelBooking);

router.post('/publish' , bookingController.sendMessageToQueue);

router.get('/test' , BookingMiddlewares.ValidateUser);

module.exports = router;