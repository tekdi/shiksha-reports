import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';

@Injectable()
export class EventHandler {
  constructor(private readonly dbService: DatabaseService) {}

  async handleEventUpsert(data: any) {
    const eventDetailsData = {
      eventDetailId: data.eventDetailsData.eventDetailId,
      title: data.eventDetailsData.title,
      shortDescription: data.eventDetailsData.shortDescription,
      eventType: data.eventDetailsData.eventType,
      isRestricted: data.eventDetailsData.isRestricted,
      location: data.eventDetailsData.location,
      longitude: data.eventDetailsData.longitude,
      latitude: data.eventDetailsData.latitude,
      onlineProvider: data.eventDetailsData.onlineProvider,
      maxAttendees: data.eventDetailsData.maxAttendees,
      recordings: data.eventDetailsData.recordings,
      status: data.eventDetailsData.status,
      description: data.eventDetailsData.description,
      meetingDetails: data.eventDetailsData.meetingDetails,
      createdBy: data.eventDetailsData.createdBy,
      updatedBy: data.eventDetailsData.updatedBy,
      idealTime: data.eventDetailsData.idealTime,
      metadata: data.eventDetailsData.metadata,
      attendees: data.eventDetailsData.attendees,
    };
    const savedEventDetails = await this.dbService.saveEventDetailsData(eventDetailsData);

    const eventData = {
      eventId: data.eventData.eventId,
      isRecurring: data.eventData.isRecurring,
      recurrenceEndDate: data.eventData.recurrenceEndDate,
      recurrencePattern: data.eventData.recurrencePattern,
      autoEnroll: data.eventData.autoEnroll,
      registrationStartDate: data.eventData.registrationStartDate,
      registrationEndDate: data.eventData.registrationEndDate,
      createdBy: data.eventData.createdBy,
      updatedBy: data.eventData.updatedBy,
      eventDetailId: savedEventDetails.eventDetailId,
    };
    const savedEvent = await this.dbService.saveEventData(eventData);

    const eventRepertation = data.eventRepetitionData.map(async (eventRepetitionData) => {
      const eventRepetitionAllData = {
        eventRepetitionId: eventRepetitionData.eventRepetitionId,
        eventId: savedEvent.eventId,
        eventDetailId: savedEventDetails.eventDetailId,
        onlineDetails: eventRepetitionData.onlineDetails,
        startDateTime: eventRepetitionData.startDateTime,
        endDateTime: eventRepetitionData.endDateTime,
        createdBy: eventRepetitionData.createdBy,
        updatedBy: eventRepetitionData.updatedBy,
        erMetaData: eventRepetitionData.erMetaData,
      };
      await this.dbService.saveEventRepetitionData(eventRepetitionAllData);
    })
  }

  async handleEventDelete(data: any) {
    if (!data.eventDetailId) {
      throw new Error('eventDetailId is required for deletion');
    }
    return this.dbService.deleteEventData({ eventDetailId: data.eventDetailId });
  }
} 