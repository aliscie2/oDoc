import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useBackendContext } from '@/contexts/BackendContext';
import { RootState } from '@/redux/reducers';
import { CalendarActions } from '$/declarations/backend/backend.did';
import { AvailabilityTimezone,EventTimezone } from '@/pages/dashBoardPage/calindarView/serializers';


interface UseCalendarSaveReturn {
  isChanged: boolean;
  loading: boolean;
  save: () => Promise<void>;
  reset: () => Promise<void>;
}

export const useCalendarSave = (): UseCalendarSaveReturn => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { backendActor } = useBackendContext();

  const { calendarChanged, calendar, calendar_actions } = useSelector(
    (state: RootState) => state.calendarState,
  );

  const save = useCallback(async () => {
    if (!backendActor || !calendar || !calendarChanged) return;

    setLoading(true);
    
    try {
      const serializedCalendar: CalendarActions = {
        ...calendar_actions,
        events: calendar_actions.events?.map((event) =>
          EventTimezone(event, true),
        ),
        availabilities: calendar_actions.availabilities.map((availability) =>
          AvailabilityTimezone(availability, true),
        ),
      };
      
      const res = await backendActor.update_calendar(
        calendar.id,
        serializedCalendar,
      );

      if (res?.Err) {
        enqueueSnackbar(res.Err, { variant: "error" });
        throw new Error(res.Err);
      } else {
        enqueueSnackbar("Calendar saved successfully!", { variant: "success" });
        dispatch({
          type: "SET_CALENDAR_CHANGED",
          calendarChanged: false,
        });
      }
    } catch (error) {
      console.error({ saveCalendarError: error });
      const errorMessage = error instanceof Error ? error.message : "Failed to save calendar";
      enqueueSnackbar(errorMessage, { variant: "error" });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [backendActor, calendar, calendar_actions, calendarChanged, dispatch, enqueueSnackbar]);


  const reset = useCallback(async () => {
    try {
      let res = await backendActor.get_calendar(calendar.id);
      res = res[0];


        res.events = res.events.map((event) => EventTimezone(event));
        res.availabilities = res.availabilities.map((event) => AvailabilityTimezone(event));
        dispatch({
          type: "SET_CALENDAR",
          calendar: res,
        });
        
      
      enqueueSnackbar("Calendar changes reset successfully!", { variant: "info" });
    } catch (error) {
      console.error({ resetCalendarError: error });
      enqueueSnackbar("Failed to reset calendar changes", { variant: "error" });
      throw error;
    }
  }, [dispatch, enqueueSnackbar,calendar.id]);

  return {
    isChanged: calendarChanged,
    loading,
    save,
    reset,
  };
};