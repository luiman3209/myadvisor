const calculateFreeWindows = (appointments, workingHours, minFreeWindowDuration) => {
    const workingStart = new Date(workingHours.start);
    const workingEnd = new Date(workingHours.end);
    const minFreeWindowMs = minFreeWindowDuration * 60 * 1000; // Convert minutes to milliseconds

    // Sort existing appointments by start time
    appointments.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    // Calculate free windows
    let freeWindows = [];
    let currentTime = workingStart;

    appointments.forEach(appointment => {
        const appointmentStart = new Date(appointment.start_time);
        const appointmentEnd = new Date(appointment.end_time);

        if (currentTime < appointmentStart && (appointmentStart - currentTime) >= minFreeWindowMs) {
            freeWindows.push({ start: currentTime, end: appointmentStart });
        }

        currentTime = appointmentEnd > currentTime ? appointmentEnd : currentTime;
    });

    if ((workingEnd - currentTime) >= minFreeWindowMs) {
        freeWindows.push({ start: currentTime, end: workingEnd });
    }

    return freeWindows;
};

module.exports = { calculateFreeWindows };
