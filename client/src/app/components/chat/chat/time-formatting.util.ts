export function formatTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}
