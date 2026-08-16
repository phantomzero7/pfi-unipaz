import { PFIEvent } from './types';

/**
 * Genera y descarga un archivo .ics estándar para Apple Calendar, Outlook y Google
 */
export function downloadIcsFile(event: PFIEvent) {
  const [startH, startM] = event.hora_inicio.split(':').map(Number);
  const [endH, endM] = event.hora_fin.split(':').map(Number);

  const eventDate = event.fecha_evento.replace(/-/g, '');
  
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const dtStart = `${eventDate}T${pad(startH)}${pad(startM)}00`;
  const dtEnd = `${eventDate}T${pad(endH)}${pad(endM)}00`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UNIPAZ PFI//Actividad Formativa//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:unipaz-${event.id}@unipaz.edu.mx`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:UNIPAZ PFI: ${event.titulo}`,
    `DESCRIPTION:${event.descripcion.replace(/\n/g, ' ')} (+${event.horas_pfi} hrs PFI)`,
    `LOCATION:${event.ubicacion || 'Campus UNIPAZ'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `unipaz-${event.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Genera la URL para agregar el evento directamente a Google Calendar web
 */
export function getGoogleCalendarUrl(event: PFIEvent): string {
  const [startH, startM] = event.hora_inicio.split(':').map(Number);
  const [endH, endM] = event.hora_fin.split(':').map(Number);

  const eventDate = event.fecha_evento.replace(/-/g, '');
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const dates = `${eventDate}T${pad(startH)}${pad(startM)}00/${eventDate}T${pad(endH)}${pad(endM)}00`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `UNIPAZ PFI: ${event.titulo}`,
    details: `${event.descripcion}\n\nAcredita +${event.horas_pfi} hrs PFI.`,
    location: event.ubicacion || 'Campus UNIPAZ',
    dates,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
