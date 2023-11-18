const axios = require('axios');
const {BookingRepository} =require('../repository/index');
const {FLIGHT_SERVICE_PATH} = require('../config/serverConfig');
const {ServiceError} = require('../utils/errors/service-error');
class BookingService {
    constructor(){
        this.bookingRepository = new BookingRepository();
    }
    // here data would be flightid and userid and noofseats
    async createBooking(data){
        try {
            const flightId = data.flightId;
            const getFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            const response = await axios.get(getFlightRequestURL);
            const flightData = response.data.data;
            let priceOfTheFlight = flightData.price;
            
            //const newSeats = data.noOfSeats;
            //console.log(typeof data.flightId , typeof data.userId , typeof data.noOfSeats);
            if(data.noOfSeats > flightData.totalSeats) {
                throw new ServiceError('Something went wrong in the booking process', 'Insufficient seats in the flight');
            }
            const totalCost = priceOfTheFlight * data.noOfSeats;

            //console.log("totalecost" , totalCost);
            const bookingPayload = {...data, totalCost};
            const booking = await this.bookingRepository.create(bookingPayload);
            const updateFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${booking.flightId}`;
            //console.log(updateFlightRequestURL);
            await axios.patch(updateFlightRequestURL, {tottalSeats: flightData.tottalSeats - booking.noOfSeats});
            const finalBooking = await this.bookingRepository.update(booking.id , {status : 'Booked'});
            return finalBooking;
            
        } catch (error) {
            if(error.name == 'RepositoryError' || error.name == 'ValidationError') {
                throw error;
            }
            throw new ServiceError();
        }
    }

    async updateBooking(bookingId , data){
        try{
            
            const prev_booking = await this.bookingRepository.get(bookingId);
            const flightId = prev_booking.flightId;
            

            const getFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            const response = await axios.get(getFlightRequestURL);
            const flightData = response.data.data;


            const add_seats = prev_booking.noOfSeats + flightData.tottalSeats;

            await axios.patch(getFlightRequestURL , {tottalSeats : add_seats});
            
            const new_flightId = data.flightId;
            const new_no_Of_seats = data.noOfSeats;


            const getFlightRequestURL_2 = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${new_flightId}`;
            const new_response = await axios.get(getFlightRequestURL_2);
            const new_flight_data = new_response.data.data;

            
            if(new_no_Of_seats > new_flight_data.totalSeats) {
                throw new ServiceError('Something went wrong in the booking process', 'Insufficient seats in the flight');
            }
            const new_total_price = (new_flight_data.price * new_no_Of_seats) + 1000 // additional fees;


            const updateFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${new_flightId}`;
            await axios.patch(updateFlightRequestURL, {tottalSeats: new_flight_data.tottalSeats - new_no_Of_seats});

            const finalBooking = await this.bookingRepository.update(bookingId , 
                {
                    status : 'Booked' , 
                    flightId : new_flightId,
                    noOfSeats : new_no_Of_seats,
                    totalCost : new_total_price
                });

            return finalBooking;
            
        }
        catch(error){
            console.log('service layer fault' , error);
            if(error.name == 'RepositoryError' || error.name == 'ValidationError') {
                throw error;
            }
            throw new ServiceError();
        }
    }

    async cancel(bookingId){
        try{

            
            const prev_booking = await this.bookingRepository.get(bookingId);
            const flightId = prev_booking.flightId;
            

            const getFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            const response = await axios.get(getFlightRequestURL);
            const flightData = response.data.data;

            const add_seats = prev_booking.noOfSeats + flightData.tottalSeats;

            await axios.patch(getFlightRequestURL , {tottalSeats : add_seats});
            
            const finalBooking = await this.bookingRepository.cancelTheBooking(bookingId , {status : 'Cancelled'});
            return finalBooking;
        }
        catch{
            console.log('service layer fault not able to delete' , error);
            if(error.name == 'RepositoryError' || error.name == 'ValidationError') {
                throw error;
            }
            throw new ServiceError();
        }
    }
}
module.exports = BookingService;


/*
            const updated_data = {
                flightNumber : response.flightNumber,
                airplaneId : response.airplaneId,
                departureAirportId : response.departureAirportId,
                arrivalAirportId : response.arrivalAirportId,
                arrivalTime : response.arrivalTime,
                departureTime : response.departureTime,
                tottalSeats : add_seats
            }*/