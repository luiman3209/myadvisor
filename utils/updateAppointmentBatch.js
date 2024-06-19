const { Op } = require('sequelize');

const { Appointment } = require('../models/models');
const updateCompletedAppointments = async () => {
    const now = new Date();
    try {
        const [updatedCount] = await Appointment.update(
            { status: 'completed' },
            {
                where: {
                    end_time: {
                        [Op.lt]: now
                    },
                    status: 'scheduled'
                }
            }
        );
        console.log(`>>> Appointment status updater >>> Updated ${updatedCount} appointments to completed.`);
    } catch (error) {
        console.error('Error updating appointments:', error);
    }
};

module.exports = updateCompletedAppointments;
