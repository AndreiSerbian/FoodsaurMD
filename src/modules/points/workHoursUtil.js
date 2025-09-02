// @ts-check

/** @typedef {{open:string, close:string}} TimeRange */
/** @typedef {{mon:TimeRange[], tue:TimeRange[], wed:TimeRange[], thu:TimeRange[], fri:TimeRange[], sat:TimeRange[], sun:TimeRange[]}} WorkHours */

/**
 * Получить сокращенные названия дней недели
 */
export const WEEKDAYS = {
  mon: 'Пн',
  tue: 'Вт', 
  wed: 'Ср',
  thu: 'Чт',
  fri: 'Пт',
  sat: 'Сб',
  sun: 'Вс'
};

/**
 * Получить полные названия дней недели
 */
export const WEEKDAYS_FULL = {
  mon: 'Понедельник',
  tue: 'Вторник',
  wed: 'Среда', 
  thu: 'Четверг',
  fri: 'Пятница',
  sat: 'Суббота',
  sun: 'Воскресенье'
};

/**
 * Создать пустые часы работы
 * @returns {WorkHours}
 */
export function createEmptyWorkHours() {
  return {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: []
  };
}

/**
 * Создать стандартные часы работы (пн-пт 9-18, сб 10-16)
 * @returns {WorkHours}
 */
export function createDefaultWorkHours() {
  return {
    mon: [{ open: '09:00', close: '18:00' }],
    tue: [{ open: '09:00', close: '18:00' }],
    wed: [{ open: '09:00', close: '18:00' }],
    thu: [{ open: '09:00', close: '18:00' }],
    fri: [{ open: '09:00', close: '18:00' }],
    sat: [{ open: '10:00', close: '16:00' }],
    sun: []
  };
}

/**
 * Валидация интервала времени
 * @param {TimeRange} timeRange
 * @returns {{valid: boolean, error?: string}}
 */
export function validateTimeRange(timeRange) {
  if (!timeRange.open || !timeRange.close) {
    return { valid: false, error: 'Время открытия и закрытия обязательны' };
  }

  const openTime = timeRange.open.split(':').map(Number);
  const closeTime = timeRange.close.split(':').map(Number);
  
  const openMinutes = openTime[0] * 60 + openTime[1];
  const closeMinutes = closeTime[0] * 60 + closeTime[1];

  if (openMinutes >= closeMinutes) {
    return { valid: false, error: 'Время закрытия должно быть позже времени открытия' };
  }

  return { valid: true };
}

/**
 * Валидация часов работы на день с проверкой пересечений
 * @param {TimeRange[]} dayHours
 * @returns {{valid: boolean, error?: string}}
 */
export function validateDayHours(dayHours) {
  if (!Array.isArray(dayHours)) {
    return { valid: false, error: 'Неверный формат часов работы' };
  }

  // Проверяем каждый интервал
  for (let i = 0; i < dayHours.length; i++) {
    const validation = validateTimeRange(dayHours[i]);
    if (!validation.valid) {
      return validation;
    }
  }

  // Проверяем пересечения между интервалами
  for (let i = 0; i < dayHours.length; i++) {
    for (let j = i + 1; j < dayHours.length; j++) {
      if (timeRangesOverlap(dayHours[i], dayHours[j])) {
        return { valid: false, error: 'Интервалы времени не должны пересекаться' };
      }
    }
  }

  return { valid: true };
}

/**
 * Проверка пересечения двух временных интервалов
 * @param {TimeRange} range1
 * @param {TimeRange} range2
 * @returns {boolean}
 */
function timeRangesOverlap(range1, range2) {
  const range1Start = timeToMinutes(range1.open);
  const range1End = timeToMinutes(range1.close);
  const range2Start = timeToMinutes(range2.open);
  const range2End = timeToMinutes(range2.close);

  return range1Start < range2End && range2Start < range1End;
}

/**
 * Конвертировать время в минуты
 * @param {string} time
 * @returns {number}
 */
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Получить название дня недели по номеру
 * @param {number} dayIndex (0 = воскресенье, 1 = понедельник, ...)
 * @returns {keyof WorkHours}
 */
function getDayKey(dayIndex) {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[dayIndex];
}

/**
 * Проверить, открыта ли точка сейчас
 * @param {WorkHours} workHours
 * @param {string} [timezone='Europe/Chisinau']
 * @returns {boolean}
 */
export function isOpenNow(workHours, timezone = 'Europe/Chisinau') {
  if (!workHours) return false;

  try {
    const now = new Date();
    const dayKey = getDayKey(now.getDay());
    const todayHours = workHours[dayKey] || [];

    if (todayHours.length === 0) return false;

    const currentTime = now.toLocaleTimeString('en-GB', { 
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    const currentMinutes = timeToMinutes(currentTime);

    return todayHours.some(range => {
      const openMinutes = timeToMinutes(range.open);
      const closeMinutes = timeToMinutes(range.close);
      return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    });
  } catch (error) {
    console.error('Error checking if open now:', error);
    return false;
  }
}

/**
 * Получить часы работы на сегодня
 * @param {WorkHours} workHours
 * @returns {TimeRange[]}
 */
export function getTodayHours(workHours) {
  if (!workHours) return [];

  const now = new Date();
  const dayKey = getDayKey(now.getDay());
  return workHours[dayKey] || [];
}

/**
 * Форматировать часы работы для отображения
 * @param {TimeRange[]} dayHours
 * @returns {string}
 */
export function formatDayHours(dayHours) {
  if (!dayHours || dayHours.length === 0) {
    return 'Закрыто';
  }

  return dayHours.map(range => `${range.open}-${range.close}`).join(', ');
}

/**
 * Получить строку с часами работы на неделю
 * @param {WorkHours} workHours
 * @returns {string}
 */
export function formatWeekHours(workHours) {
  if (!workHours) return 'Часы работы не указаны';

  const days = Object.keys(WEEKDAYS);
  const schedule = [];

  for (const day of days) {
    const dayHours = workHours[day] || [];
    const formatted = formatDayHours(dayHours);
    schedule.push(`${WEEKDAYS[day]}: ${formatted}`);
  }

  return schedule.join('\n');
}

/**
 * Получить статус точки (открыто/закрыто/скоро откроется/скоро закроется)
 * @param {WorkHours} workHours
 * @param {string} [timezone='Europe/Chisinau']
 * @returns {{status: 'open'|'closed'|'opening_soon'|'closing_soon', message: string}}
 */
export function getPointStatus(workHours, timezone = 'Europe/Chisinau') {
  if (!workHours) {
    return { status: 'closed', message: 'Закрыто' };
  }

  try {
    const now = new Date();
    const dayKey = getDayKey(now.getDay());
    const todayHours = workHours[dayKey] || [];

    if (todayHours.length === 0) {
      return { status: 'closed', message: 'Сегодня закрыто' };
    }

    const currentTime = now.toLocaleTimeString('en-GB', { 
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    const currentMinutes = timeToMinutes(currentTime);

    // Проверяем каждый интервал
    for (const range of todayHours) {
      const openMinutes = timeToMinutes(range.open);
      const closeMinutes = timeToMinutes(range.close);

      // Открыто сейчас
      if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
        // Скоро закрывается (за 30 минут)
        if (closeMinutes - currentMinutes <= 30) {
          return { status: 'closing_soon', message: `Открыто до ${range.close}` };
        }
        return { status: 'open', message: `Открыто до ${range.close}` };
      }

      // Скоро откроется (за 30 минут)
      if (openMinutes - currentMinutes <= 30 && openMinutes > currentMinutes) {
        return { status: 'opening_soon', message: `Откроется в ${range.open}` };
      }
    }

    // Найти следующее время открытия сегодня
    const nextTodayOpening = todayHours.find(range => timeToMinutes(range.open) > currentMinutes);
    if (nextTodayOpening) {
      return { status: 'closed', message: `Откроется в ${nextTodayOpening.open}` };
    }

    return { status: 'closed', message: 'Закрыто' };
  } catch (error) {
    console.error('Error getting point status:', error);
    return { status: 'closed', message: 'Закрыто' };
  }
}