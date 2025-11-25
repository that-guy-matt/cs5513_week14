import {parseISO, format } from 'date-fns';

export default function Date({ dateString }) {
    if (!dateString) {
        return null;
    }
    
    const date = parseISO(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return null;
    }
    
    return <time dateTime={dateString}>{format(date, 'LLLL d, yyyy')}</time>
}