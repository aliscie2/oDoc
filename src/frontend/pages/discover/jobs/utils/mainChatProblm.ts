export const MAIN_CHAT_PROMPT = `
extract data from the message appove and return only json like this
{
type:"CALENDAR", // This can be CALENDAR|JOBS
feedback:"",// if not clear what to decied  CALENDAR|JOBS tell the user to clearify, and set type to null
}
if the message talk about events, calls, meeting, dates, availabilities ,booking chose CALENDAR
if the message talk about job, cv, resume, hiring, looking for developer, looking for company, startup etc. chose type to JOBS
if the person talkig about what is he looking for, or what is he good at also JOBS
`;
