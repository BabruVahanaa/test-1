import { AppointmentType, Booking, Class } from '../contexts/EventContext';

const dayNameToIndex: { [key: string]: number } = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export const getValidClassDates = (classItem: Class): Date[] => {
    const validDates: Date[] = [];
    const { startDate, endDate, days } = classItem.schedule;
    if (!startDate || days.length === 0) return [];
    
    let currentDate = new Date(startDate + 'T00:00:00Z');
    const finalDate = endDate ? new Date(endDate + 'T23:59:59Z') : new Date(currentDate);
    if (!endDate) {
      finalDate.setMonth(finalDate.getMonth() + 3); // Limit to 3 months in the future if no end date
    }

    const validDays = days.map(day => dayNameToIndex[day]);

    while (currentDate <= finalDate) {
        if (validDays.includes(currentDate.getUTCDay())) {
            validDates.push(new Date(currentDate));
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    
    return validDates;
};

export const getAvailableSlots = (
  appointmentType: AppointmentType,
  existingBookings: Booking[],
  targetDate: Date
): string[] => {
    const availableSlots: string[] = [];
    const dayOfWeek = targetDate.toLocaleString('en-US', { weekday: 'short', timeZone: 'UTC' }) as keyof typeof dayNameToIndex;
    
    const dayAvailability = appointmentType.weeklyAvailability.find(d => d.day === dayOfWeek);

    if (!dayAvailability || !dayAvailability.enabled) {
        return [];
    }

    const targetDateString = targetDate.toISOString().split('T')[0];
    const bookingsForDay = existingBookings.filter(b => b.eventDate === targetDateString && b.serviceId === appointmentType.id && b.serviceType === 'appointment');
    
    dayAvailability.slots.forEach(slot => {
        let currentTime = parseTime(slot.from);
        const endTime = parseTime(slot.to);

        while (currentTime + appointmentType.duration * 60 * 1000 <= endTime) {
            const slotDate = new Date(currentTime);
            const slotTimeStr = slotDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });

            const isBooked = bookingsForDay.some(booking => {
                if (!booking.eventTime) return false;
                const bookingTime = new Date(`1970-01-01T${booking.eventTime}Z`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });
                return bookingTime === slotTimeStr;
            });
            
            if (!isBooked) {
                availableSlots.push(slotTimeStr);
            }

            currentTime += appointmentType.duration * 60 * 1000;
        }
    });

    return availableSlots;
};


function parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(0);
    date.setUTCHours(hours, minutes, 0, 0);
    return date.getTime();
}