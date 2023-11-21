const axios = require('axios');
const {BookingRepository} =require('../repository/index');
const {FLIGHT_SERVICE_PATH} = require('../config/serverConfig');
const {ServiceError} = require('../utils/errors/service-error');

const {createChannel , publishMessage} = require('../utils/messageQueue');
const {REMINDER_BINDING_KEY} = require('../config/serverConfig');
class BookingService {
    constructor(){
        this.bookingRepository = new BookingRepository();
    }
    // here data would be flightid and userid and noofseats and accesstoken
    async createBooking(data){
        try {
            const flightId = data.flightId;
            const getFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            const response = await axios.get(getFlightRequestURL);
            const flightData = response.data.data;
            let priceOfTheFlight = flightData.price;
            

            if(data.noOfSeats > flightData.totalSeats) {
                throw new ServiceError('Something went wrong in the booking process', 'Insufficient seats in the flight');
            }
            const totalCost = priceOfTheFlight * data.noOfSeats;

            
            const bookingPayload = {...data, totalCost};
            const booking = await this.bookingRepository.create(bookingPayload);


            const updateFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${booking.flightId}`;
            await axios.patch(updateFlightRequestURL, {tottalSeats: flightData.tottalSeats - booking.noOfSeats});

   
            const finalBooking = await this.bookingRepository.update(booking.id , {status : 'Booked'});

            const channel = await createChannel();
            const payload = {
                data: {
                    subject: 'Succesfully booked the flight ',
                    content: 'thanks for booking the flights hope you liked our service',
                    recepientEmail: 'hk8810254@gmail.com',
                    notificationTime: new Date()  // Corrected: Add parentheses to invoke the Date constructor
                },
                service: 'CREATE_TICKET'
            };
            
            publishMessage(channel , REMINDER_BINDING_KEY , JSON.stringify(payload));


            const departure_time = new Date(flightData.departureTime);
            // Subtract one day from the departure time
            departure_time.setDate(departure_time.getDate() - 1);
            const Reminder_Payload = {
                data: {
                    subject: 'Reminder for your flight ',
                    content: `your flight is in next 24 hours and your flight number is ${flightData.flightNumber}`,
                    recepientEmail: 'hk8810254@gmail.com',
                    notificationTime: departure_time  // Corrected: Add parentheses to invoke the Date constructor
                },
                service: 'CREATE_TICKET'
            };

            publishMessage(channel , REMINDER_BINDING_KEY , JSON.stringify(Reminder_Payload));
            return finalBooking;
            
        } catch (error) {
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
            

            const channel = await createChannel();
            const payload = {
                data: {
                    subject: 'Succesfully cancelled the flight ',
                    content: 'your booking have been succefully cancelled',
                    recepientEmail: 'hk8810254@gmail.com',
                    notificationTime: new Date()  // Corrected: Add parentheses to invoke the Date constructor
                },
                service: 'CREATE_TICKET'
            };
            publishMessage(channel , REMINDER_BINDING_KEY , JSON.stringify(payload));
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