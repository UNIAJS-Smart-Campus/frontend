import { useFetch, useApi } from "./useApi";
import {
  requestsApi,
  eventsApi,
  notificationsApi,
  feedbackApi,
  resourcesApi,
  reservationsApi,
  servicesApi,
  reportsApi
} from "../utils/api";

export function useRequests() {
  return useFetch(requestsApi.list);
}

export function useRequestActions() {
  return useApi(requestsApi.create, false);
}

export function useEvents() {
  return useFetch(eventsApi.list);
}

export function useEventActions() {
  return useApi(eventsApi.create, false);
}

export function useNotifications() {
  return useFetch(notificationsApi.list);
}

export function useNotificationActions() {
  return useApi(notificationsApi.markRead, false);
}

export function useFeedback() {
  return useFetch(feedbackApi.list);
}

export function useFeedbackActions() {
  return useApi(feedbackApi.create, false);
}

export function useResources() {
  return useFetch(resourcesApi.list);
}

export function useResourceActions() {
  return useApi(resourcesApi.create, false);
}

export function useReservations() {
  return useFetch(reservationsApi.list);
}

export function useServices() {
  return useFetch(servicesApi.list);
}

export function useReports() {
  return useFetch(reportsApi.get);
}
