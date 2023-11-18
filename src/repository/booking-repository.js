const {Booking} = require('../models/index');
const {StatusCodes} = require('http-status-codes');
const {ValidationError , AppError} = require('../utils/errors/index');

class BookingRepository{
    async create(data){
        try {
            const booking = await Booking.create(data);
            return booking;
        } catch (error) {
            if(error.name == 'SequelizeValidationError'){
               throw new ValidationError(error);
            }
            throw new AppError('RepositoryError', 
            'Cannot create Booking', 
            'There was some issue creating the booking, please try again later',
            StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async update(bookingId, data) {
        try {
            const booking = await Booking.findByPk(bookingId);
            console.log("repo working");
            if(data.status){
                booking.status = data.status;
                booking.flightId = data.flightId;
                booking.noOfSeats = data.noOfSeats;
                booking.totalCost = data.totalCost
            }
            await booking.save();
            return booking;
        } catch (error) {
            throw new AppError(
                'RepositoryError', 
                'Cannot update Booking', 
                'There was some issue updating the booking, please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelTheBooking(bookingId, data) {
        try {
            const booking = await Booking.findByPk(bookingId);
            console.log("repo working");
            if(data.status){
                booking.status = data.status;
            }
            await booking.save();
            return booking;
        } catch (error) {
            throw new AppError(
                'RepositoryError', 
                'Cannot update Booking', 
                'There was some issue updating the booking, please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    
    async get(bookingId){
        try{
            const response = await Booking.findByPk(bookingId);
            return response;
        }
        catch(error){
            throw new AppError(
                'RepositoryError', 
                'Cannot get Booking', 
                'There was some issue getting the booking, please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getByuserId(userId){
        try{
            const response = await Booking.findOne({
                where : {
                    userId : userId
                }
            })

            return response;
        }
        catch(error){
            throw new AppError(
                'RepositoryError', 
                'Cannot get Booking by userid', 
                'There was some issue getting the booking, please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = BookingRepository;