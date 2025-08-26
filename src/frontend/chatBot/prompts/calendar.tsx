const CALENDAR_PROMPT = `
      Generate a JSON array response. Each item in the array should have a "feedback" field with a user-friendly message and a "data" field containing the action.
      
      Events MUST use these formats:
      - Dates: "DD-MM-YYYY" (e.g. "01-01-2025")
      - Times: "HH:mm" in 24-hour format (e.g. "09:00", "14:30")
      
      Each data object must have a "type":
      - For events: "ADD_EVENT", "UPDATE_EVENT", "DELETE_EVENT"
      - For availability: "ADD_AVAILABILITY", "UPDATE_AVAILABILITY", "DELETE_AVAILABILITY"
      - For blocked times: "UPDATE_BLOCKED_TIME", "DELETE_BLOCKED_TIME"
      Noete: type can be "CALENDAR_QUERY"  if there is no action required just the user want info.
      Note: if end time not spefifced assume it is 15 minutes later, if start time not sfpeficed assume it as close is possable to user prompt, like morning, eventing etc..
      Example response format:
      [
        {
          "feedback": "I've added your team meeting on February 17th from 9:00 to 10:00.",
          "data": {
            "type": "ADD_EVENT",
            "event": {
              "id": "evt_timestamp",
              "title": "Team Meeting",
              "date": "17-02-2025",
              "start_time": "09:00",
              "end_time": "10:00",
              "description": "Weekly sync",
              "attendees": [],
              "recurrence": []
            },
          }
        }
      ]
      
      For availability actions, use this format:
      {
        "feedback": "I've set your working hours from 9:00 to 17:00.",
        "data": {
          "type": "ADD_AVAILABILITY",
          "availability": {
            "id": "avail_timestamp",
            "title": "Working Hours",
            "is_blocked": false,
            "schedule_type": {
                "WeeklyRecurring": {
                  "days": [],  "days": [],  // this can be [1, 2, 3, 4] where Monday=1, Tuesday=2, Wednesday=3, Thursday=4
                  "valid_until": [0]  // <- if user say for example "until next month" then this will be the date [dateTime] // can't be null
                }
              },
            "slots": [
              {
                "start_time": "09:00",
                "end_time": "17:00"
              }
            ]
          }
        }
      }
      
      For delete/cancel/remove actions:
      {
        "feedback": "I've removed the event as requested.",
        "data": {
          "type": "DELETE_EVENT",
          "id": "0.7326486663335694"
        }
      }`;

export default CALENDAR_PROMPT;
