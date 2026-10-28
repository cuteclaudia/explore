import {CRAFT_TOOLS,resolveToolId} from './craft-tools.mjs';
// Desktop catalogue is separate from web engines, launch routes and storage contracts.
export const DESKTOP_TOOLS=Object.freeze({...CRAFT_TOOLS,
 tayori:{name:'Tayori',slug:'tayori',desktopOnly:true,description:'Mail, calendar, contacts and tasks. Desktop release in development.'},
 goban:{name:'Goban',slug:'goban',desktopOnly:true,description:'Spreadsheets and data. Desktop release in development.'},
});
export const resolveDesktopToolId=value=>Object.hasOwn(DESKTOP_TOOLS,value)?value:resolveToolId(value);
