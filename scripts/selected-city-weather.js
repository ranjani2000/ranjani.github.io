export function timestamp(timeZone) {
  let options = { 
    timeZone: timeZone, 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric',
    minute: 'numeric', 
    second: 'numeric' 
  };
  let now = new Date().toLocaleString('en-US', options); 
  let [monthDate, year, fullTime] = now.split(', ');
  let [month, date] = monthDate.split(' ');
  let [time, amPm] = fullTime.split(' ');
  let [hours, minutes, seconds] = time.split(":");
  return {
    'seconds': seconds,
    'minutes': minutes,
    'hours': (hours%12 == 0? "12": hours%12).toString(),
    'hours':(hours<10 ? '0'+hours : hours),
    'amPm' : amPm.toLowerCase(),
    'date': date,
    'month': month,
    'year': year
  };
}
  