import { format, isToday, isTomorrow, isYesterday, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd \'de\' MMMM, yyyy', { locale: ptBR });
}

export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return 'Hoje';
  }
  
  if (isTomorrow(dateObj)) {
    return 'Amanhã';
  }
  
  if (isYesterday(dateObj)) {
    return 'Ontem';
  }
  
  return format(dateObj, 'dd/MM', { locale: ptBR });
}

export function getCurrentWeekString(): string {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
  
  const startDay = format(start, 'dd');
  const endDay = format(end, 'dd');
  const month = format(end, 'MMMM', { locale: ptBR });
  const year = format(end, 'yyyy');
  
  return `Semana de ${startDay} a ${endDay} de ${month}, ${year}`;
}

export function getWeekDates(weekOffset: number = 0): Date[] {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const adjustedStart = addDays(start, weekOffset * 7);
  
  return Array.from({ length: 7 }, (_, i) => addDays(adjustedStart, i));
}
