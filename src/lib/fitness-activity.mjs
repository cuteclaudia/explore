export function activityDuration(seconds){if(!Number.isFinite(seconds)||seconds<0)return 'Not available';const minutes=Math.floor(seconds/60);return minutes>=60?Math.floor(minutes/60)+' h '+minutes%60+' min':minutes+' min';}
export function activityDistance(metres){return Number.isFinite(metres)&&metres>=0?(metres/1000).toFixed(1)+' km':'Not available';}
