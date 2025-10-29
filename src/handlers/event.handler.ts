import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import {
  EventData,
  validateRequired,
  validateString,
  ValidationError,
} from '../types';

@Injectable()
export class EventHandler {
  constructor(private readonly dbService: DatabaseService) {}

  async handleEventUpsert(data: EventData) {
    try {
      // Validate required fields
      validateRequired(data.eventDetailsData, 'eventDetailsData');
      validateRequired(data.eventData, 'eventData');
      validateRequired(data.eventRepetitionData, 'eventRepetitionData');

      validateString(
        data.eventDetailsData.eventDetailId,
        'eventDetailsData.eventDetailId',
      );
      validateString(data.eventData.eventId, 'eventData.eventId');

      if (!Array.isArray(data.eventRepetitionData)) {
        throw new ValidationError(
          'eventRepetitionData must be an array',
          'eventRepetitionData',
        );
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(`Validation failed: ${error.message}`);
      }
      throw error;
    }

    // Coercion helpers to ensure correct types
    const coerceString = (v: any) =>
      v === undefined || v === null ? null : String(v);
    const coerceDecimal = (v: any) =>
      v === undefined || v === null || v === '' ? null : String(v);
    const coerceDate = (v: any) => (v ? new Date(v) : null);
    const coerceJson = (v: any) => {
      if (v === undefined || v === null || v === '') return null;
      if (typeof v === 'string') {
        try {
          return JSON.parse(v);
        } catch {
          return v;
        }
      }
      return v;
    };

    // Single table flow: directly save into Events for each repetition
    await Promise.all(
      data.eventRepetitionData.map(async (eventRepetitionData) => {
        await this.dbService.saveEventData({
          eventDetailId: coerceString(data.eventDetailsData.eventDetailId)!,
          title: coerceString(data.eventDetailsData.title),
          shortDescription: coerceString(
            data.eventDetailsData.shortDescription,
          ),
          eventType: coerceString(data.eventDetailsData.eventType),
          isRestricted: !!data.eventDetailsData.isRestricted,
          location: coerceString(data.eventDetailsData.location),
          longitude: coerceDecimal(data.eventDetailsData.longitude) as any,
          latitude: coerceDecimal(data.eventDetailsData.latitude) as any,
          onlineProvider: coerceString(data.eventDetailsData.onlineProvider),
          maxAttendees: data.eventDetailsData.maxAttendees ?? null,
          recordings: coerceJson(data.eventDetailsData.recordings),
          status: coerceString(data.eventDetailsData.status),
          description: coerceString(data.eventDetailsData.description),
          meetingDetails: coerceJson(data.eventDetailsData.meetingDetails),
          createdBy: coerceString(data.eventDetailsData.createdBy),
          updatedBy: coerceString(data.eventDetailsData.updatedBy),
          idealTime: coerceString(data.eventDetailsData.idealTime),
          metadata: coerceJson(data.eventDetailsData.metadata),
          attendees: coerceJson(data.eventDetailsData.attendees),
          eventId: coerceString(data.eventData.eventId),
          startDateTime: coerceDate(eventRepetitionData.startDateTime),
          endDateTime: coerceDate(eventRepetitionData.endDateTime),
          onlineDetails: coerceJson(eventRepetitionData.onlineDetails),
          isRecurring: !!data.eventData.isRecurring,
          recurrenceEndDate: coerceDate(data.eventData.recurrenceEndDate),
          recurrencePattern: coerceJson(data.eventData.recurrencePattern),
          autoEnroll: !!data.eventData.autoEnroll,
          extra: coerceJson((data as any).extra),
          registrationStartDate: coerceDate(
            data.eventData.registrationStartDate,
          ),
          registrationEndDate: coerceDate(data.eventData.registrationEndDate),
        });
      }),
    );
  }

  async handleEventDelete(data: { eventDetailId: string }) {
    try {
      validateString(data.eventDetailId, 'eventDetailId');
      return this.dbService.deleteEventData({
        eventDetailId: data.eventDetailId,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(`Validation failed: ${error.message}`);
      }
      throw error;
    }
  }
}
