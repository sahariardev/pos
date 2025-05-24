import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
    if (typeof date === 'string') {
        date = new Date(date)
    }
    return new Intl.DateTimeFormat('en-US').format(date)
}


function getDate(date: Date | string) {
    if (typeof date === 'string') {
        date = new Date(date);
        date.setHours(date.getHours() + 6);
    }

    return date;
}

export function formatDateWithTime(date: Date | string) {
    date = getDate(date)
    const day = date.getDate();
    const month = date.toLocaleString('en-US', {month: 'long'});
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const suffix = (d: number) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
            default:
                return 'th';
        }
    };

    const formattedTime = date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return `${day}${suffix(day)} ${month} ${year} ${formattedTime}`;
}