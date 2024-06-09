

const { Op } = require('sequelize');
const { Advisor, Appointment } = require('../models/models');


const minFreeWindowDuration = 30; // Minimum free window duration in minutes


// Helper function to generate time slots
const generateTimeSlots = (start, end, interval = minFreeWindowDuration) => {
    const slots = [];
    let current = new Date(start);

    while (current < end) {
        slots.push(current.toTimeString().substring(0, 5));
        current = new Date(current.getTime() + interval * 60000); // Add interval minutes
    }

    return slots;
}

// Helper function to convert "HHmm" string to Date object
const convertToTime = (date, timeString) => {
    const hours = parseInt(timeString.substring(0, 2), 10);
    const minutes = parseInt(timeString.substring(2, 4), 10);
    return new Date(date.setHours(hours, minutes, 0, 0));
}

// Send email function
const retrieveFreeWindows = async (advisorId, startDate, endDate) => {
    // Return error if time range is longer than 5 days
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 10) {
        return res.status(400).send('Time range must be less than 10 days');
    }


    // Get the advisor's working hours
    const advisor = await Advisor.findByPk(advisorId);
    if (!advisor) {
        return res.status(404).send('Advisor not found');
    }

    const workingHoursShift1 = {
        start: advisor.start_shift_1,
        end: advisor.end_shift_1,
    };

    // Get all appointments for the advisor between the start and end dates
    const appointments = await Appointment.findAll({
        where: {
            advisor_id: advisorId,
            start_time: {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            },
        },
        order: [['start_time', 'ASC']],
    });

    // Generate time slots for each day between startDate and endDate
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    const freeWindows = {};

    while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayStart = convertToTime(new Date(currentDate), workingHoursShift1.start);
        const dayEnd = convertToTime(new Date(currentDate), workingHoursShift1.end);
        const allSlots = generateTimeSlots(dayStart, dayEnd);
        // Remove booked slots
        const bookedAppointments = appointments
            .filter(appt => {
                const apptDate = appt.start_time.toISOString().split('T')[0];
                return apptDate === dateStr;
            });

        const bookedSlots = bookedAppointments
            .map(appt => {
                const start = new Date(appt.start_time);
                const end = new Date(appt.end_time);
                return generateTimeSlots(start, end);
            })
            .flat();


        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
        freeWindows[dateStr] = availableSlots;

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return freeWindows;
};

module.exports = {
    retrieveFreeWindows,
};
