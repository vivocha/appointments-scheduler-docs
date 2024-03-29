# Vivocha Appointments Scheduler

## Technical and API Documentation

| ![Logo](https://github.com/vivocha/appointments-scheduler-docs/blob/master/img/logo.png?raw=true) |
| :-----------------------------------------------------------------------------------------------: |
|                                                                                                   |

_version 3.1.3_ - last update: _06/10/2022_

---

## Table of Contents

- [Overview](#overview)
- [Calendar and Appointment Types](#calendar-and-appointment-types)
  - [Calendar Configuration](#calendar-configuration)
  - [Calendar Configuration](#calendar-configuration)
    - [Email Configuration](#email-configuration)
    - [Web Templates](#web-templates)
    - [Appointment Types](#appointment-types)
      - [Appointment Types Settings](#appointment-type-settings)
        - [Appointment Location Settings](#appointment-location-settings)
- [Appointment](#appointment)
  - [Appointment Context](#appointment-context)
  - [Appointment State](#appointment-state)
- [API](#api)
  - [RQL Queries](#rql-queries)
  - [Pagination](#pagination)
  - [CSV Format](#csv-format)
  - [Calendar API](#calendar-api)
    - [Private Endpoints](#calendar-private-endpoints)
    - [Public Endpoints](#calendar-public-endpoints)
  - [Appointment API](#appointment-api)
    - [Private Endpoints](#appointment-private-endpoints)
    - [Public Endpoints](#appointment-public-endpoints)
- [Interaction Engine Blocks](#interaction-engine-blocks)
  - [Get Appointments Types](#get-appointment-types)
  - [Get Availabilities](#get-availabilities)
  - [Set Appointment](#set-appointment)

---

---

## Overview

The Appointments Scheduler is a module of the Vivocha platform which allows to set and manage appointments with customers. Appointments can be both _online_ and _physical_, location-based.

The Appointments Scheduler exposes a public and a private API, and also can send emails to customers in different moments: to confirm the appointment, and two reminders.

The Appointments Scheduler is based on three main entities: _Calendar_, _Appointment Type_ and _Appointment_, as shown in the next picture.

| ![Appointments Scheduler Main Entities](https://github.com/vivocha/appointments-scheduler-docs/blob/master/img/overview.svg?sanitize=true) |
| :----------------------------------------------------------------------------------------------------------------------------------------: |
|                                       **FIGURE 1 - Appointments Scheduler Main Entities and Model**                                        |

This repository is structured as follows:

- `code-and-config` folder contains an example of a Calendar, in JSON; the default AWS SES email templates used by the Appointments Scheduler; the Vivocha Campaign sample event-handlers, used in a demo integration, and a conversation script, used in the same demo;
- the `docs` folder contains a brief documentation about the scheduler integration done for demo purposes.

---

## Calendar and Appointment Types

The _Calendar_ is the main entity of the Appointments Scheduler.
A Calendar represents a well-defined, configured container of Appointments.

A Calendar can be linked to several Vivocha Campaigns. A Vivocha Campaign can be linked to one and only one Calendar.

Along with several basic properties, like name, timezone, language, and so on..., a Calendar has a detailed configuration, and it also defines a set of _Appointment Types_, which represents all the types of appointment that it is possible to book/set in the specific Calendar.
For example, a _Tax Consultancy_ Calendar could define some Appointment Types like: _Private support_, _Company support_, and so on...
A Calendar can accept the booking of appointments only of the types it explicitely defines.

A Calendar can be exported and "read" by its _iCalendar_ representation by the API. It is useful to subscribe to a particular Calendar through a Calendar App (like Apple Calendar and others...) using that clients as a refresheable view on the Calendar Appontments (see more in the dedicatet API endpoint, [here](#calendar-public-endpoints)).

In the current version of the Appointments Scheduler, a Calendar has the following properties:

| PROPERTY           | VALUE                            | DESCRIPTION                                                                                                                                         |
| ------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_id`              | string                           | the Calendar Id                                                                                                                                     |
| `acct_id`          | string                           | Vivocha Account Id to which the calendar belongs                                                                                                    |
| `name`             | string                           | The name of the Calendar                                                                                                                            |
| `description`      | (optional) string                | free text description                                                                                                                               |
| `company`          | (optional) string                | The name of the company that will be also exported in the iCal format and eventually used in the emails sent to the customers. Default is `Vivocha` |
| `timezone`         | string                           | [Timezone string in IANA format](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), like `Europe/Rome`                                  |
| `language`         | (optional) string                | Calendar language string, like `en`, `it`, `fr`. Default is `en`                                                                                    |
| `media`            | string                           | Calendar starting media, like `chat` (currently not used)                                                                                           |
| `appointmentTypes` | array of AppointmentType objects | the appointment types that can be set in the specific Calendar, see dedicated section below                                                         |
| `configuration`    | object                           | the Calendar Configuration, see section below                                                                                                       |

---

### Calendar Configuration

Current version provides a static configuration of the Calendar.
Calendar Configuration properties follow:

| PROPERTY                    | VALUE                      | DESCRIPTION                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `availabilityHours`         | (optional) object          | defines the general availability (when an appointment can be set) days and hours of the Calendar, including exceptions (when an appointment can't be set). An AppointmentType can add its own availability exceptions. Availability Hours are in the same format as the Vivocha Campaign's Opening Hours. To include a whole day interval, simply exclude the hours property from the interval. However this practice is not recommended, it's a good practice, and a more effective way to set availability hours, specifying the precise range of hours that are really useful, depending on the business case; for example: 9-18, 8-17, and so on... A detailed description of the [**Opening Hours** format can be found in the dedicated section of this document](#opening-hours). |
|                             |
| `maxConcurrentAppointments` | (optional) number, integer | the maximum number of concurrent appointments that can be set in this calendar. Appointment Types can decrease the max concurrent number for a particular type of appointment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tags`                      | (optional) array of string | Calendar tags (currently not used)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `exclusiveAgents`           | (optional) array of string | a list of Vivocha Agents Ids (currently not used)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `email`                     | (optional) object          | configuration object for the emails to send to customers, see below in this section                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `webTemplates`              | (optional) object          | strings to be shown to customers on a browser, for example when it cancels an appointment by a link in an email. Strings are set by language code. See below in the next sections                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `landingPageUrl`            | (optional) string          | the URL of the page to redirect customers to join the online appointment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

---

#### Email Configuration

The Appointments scheduler sends some emails to the customers involved in appointments. Emails are sent in different moments:

- when the appointment is created and set, with links to download an iCal file and to cancel the appointment
- one hour before the appointment, as a reminder, with the option to cancel the appointment
- ten minutes before the appointment, as a reminder, with the option to cancel the appointment and, only in case of an _online_ appointment type, a link to join the appointment with an agent at the set date/hour.
- moreover, an email is also sent if the customer cancels the appointment at any moment. In that case, reminders will not be sent anymore.

The Appointments Scheduler uses **AWS SES service** to send the required emails, and they are based on templates ([find more here](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/send-personalized-email-api.html)). Thus, it is necessary, as a first step, to upload all the required custom AWS SES templates before configuring a Calendar, otherwise the Vivocha default templates will be automatically used to compose emails.

The Calendar Email configuration is based on the following properties:

| PROPERTY        | VALUE                       | DESCRIPTION                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `senderAddress` | string                      | Email address to use as sender. It MUST be previously verified by AWS SES before configuring it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `ccAddresses`   | (optional) array of strings | A list of email addresses to send emails in Cc                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `bccAddresses`  | (optional) array of strings | A list of email addresses to also send emails in Bcc                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `template`      | (optional) object           | Email templates configuration. It is an object that can have two properties named `online` or `external`. These properties are of type object, and they are intended to contain the email templates configuration for the particular appointment macro-type. The referenced object has two main properties: 1) `templateName`, mandatory, is an object with the following properties (all optional): `customerNewAppointment`, `customerCancelAppointment`, `agentNewAppointment` (currently not used), `agentCancelAppointment` (currently not used), `customerRemindAppointment`, `customerLandingRemindAppointment`, `agentRemindAppointment` (currently not used). Each of these properties are object with a language string as a key (e.g., `en`, `it`), and a corresponding registered AWS SES template name. If a template is not configured for a given calendar language, then english is used. 2) `templateData` (optional), an object representing the data to be sent in emails and must match the data keys referenced by AWS SES registered templates (currently not used). |

---

An example of email configuration, referencing the default email templates provided by Vivocha, can be the following:

```json
 "email" : {
    "senderAddress" : "mobile@vivocha.com",
    "template" : {
        "online" : {
            "templateName" : {
                "customerNewAppointment" : {
                    "en" : "VivochaDefaultTemplateEN",
                    "it" : "VivochaDefaultTemplateIT"
                },
                "customerCancelAppointment" : {
                    "en" : "VivochaDefaultCancelledTemplateEN",
                    "it" : "VivochaDefaultCancelledTemplateIT"
                },
                "customerRemindAppointment" : {
                    "en" : "VivochaDefaultCustRemindTemplateEN",
                    "it" : "VivochaDefaultCustRemindTemplateIT"
                },
                "customerLandingRemindAppointment" : {
                    "en" : "VivochaDefaultCustLandingRemindTemplateEN",
                    "it" : "VivochaDefaultCustLandingRemindTemplateIT"
                }
            }
        },
        "external" : {
            "templateName" : {
                "customerNewAppointment" : {
                    "en" : "ExternalDefaultTemplateEN",
                    "it" : "ExternalDefaultTemplateIT"
                },
                "customerCancelAppointment" : {
                    "en" : "ExternalDefaultCancelledTemplateEN",
                    "it" : "ExternalDefaultCancelledTemplateIT"
                },
                "customerRemindAppointment" : {
                    "en" : "ExternalDefaultCustRemindTemplateEN",
                    "it" : "ExternalDefaultCustRemindTemplateIT"
                },
                "customerLandingRemindAppointment" : {
                    "en" : "ExternalDefaultCustLandingRemindTemplateEN",
                    "it" : "ExternalDefaultCustLandingRemindTemplateIT"
                }
            }
        }
    }
}
```

In the previous example, the configuration references the real default template names already loaded and available in AWS SES, for english and italian languages.

#### Web Templates

Web templates are the messages to be shown to the customer a the result of some actions. Currently, only the (optional) `appointmentCancelled` and `appointmentAlreadyCancelled` are supported, and they are rendered in the browser when the customer cancels the appointment by selecting the related link/button in a received email. if templates are not configured for a specific language, then english is used.
Subproperties keys are the language code, as in the following, default, example:

```json
"webTemplates" : {
    "appointmentCancelled" : {
        "en" : "Your appointment has been successfully cancelled. You will receive a confirmation email very soon. Thank you.",
        "it" : "Il tuo appuntamento è stato cancellato, riceverai una email di conferma al più presto. Grazie."
    },
    "appointmentAlreadyCancelled": {
      "en": "Appointment already cancelled or completed.",
      "it": "Appuntamento già cancellato o completato."
    }
}
```

#### Appointment Types

An Appointment Type is the definition of a type of an appointment that can be set in a specific Calendar.
Basically, the current version supports the definition of two _macro-types_: appointments of _online_ type, and of _external_ type. The former is an online appointment, e.g., to happen through the Vivocha platform; the latter is a _de visu_, location-based appointment.

An Appointment Type defines several properties, summarized by the next table:

| PROPERTY                    | VALUE                      | DESCRIPTION                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                      | string                     | the name of the type, MUST BE unique in the context of the same Calendar, it is used as its id                                                                                                                                                                                                                                                                                                                                                                 |
| `type`                      | string                     | _macro-type_, admitted values are: `online` and `external`                                                                                                                                                                                                                                                                                                                                                                                                     |
| `description`               | (optional) string          | a free text description                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `image`                     | (optional) string          | URL of an image to associate to the appointment type                                                                                                                                                                                                                                                                                                                                                                                                           |
| `color`                     | (optional) string          | Hex number string of the color to associate to the appointment type                                                                                                                                                                                                                                                                                                                                                                                            |
| `timezone`                  | (optional) string          | [Timezone in IANA format](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) for the specific Appointment Type, if not specified it will be used the one defined globally in the Calendar                                                                                                                                                                                                                                                           |
| `duration`                  | number, integer            | the duration of the appointment, in minutes                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `paddingBefore`             | (optional) number, integer | extra time to take into consideration before the starting date-time of the appointment, in minutes (currently not used)                                                                                                                                                                                                                                                                                                                                        |
| `paddingAfter`              | (optional) number, integer | extra time to take into consideration after the end date-time of the appointment, in minutes. If set, the duration of the appointment will be the same, but the allocated time slot will be `duration + paddingAfter`                                                                                                                                                                                                                                          |
| `ignorePaddingOnLastSlot`   | (optional) boolean         | do not use `paddingAfter` on the last slot of the day in availability computing. **Default is `false`**; in other words, by default the `paddingAfter` value (if set) is also added to the last slot of the day when slots availability computing is performed. This could result in excluding that slot if `duration + paddingAfter` generates a slot which exceedes the service closing hour in that day.                                                    |
| `validity`                  | (optional) object          | validity represents the interval of time when an appointment joining/landing can be considered valid before considering the customer in late or too early. The validity object has the following optional two properties: `before` and `after`, both numbers, expressed in minutes. Default value is 3 minutes for both properties.                                                                                                                            |
| `isActive`                  | (optional) boolean         | an Appointment type can be deactivated (currently not used)                                                                                                                                                                                                                                                                                                                                                                                                    |
| `availabilityHours`         | (optional) object          | like the Calendar's availability hours but only `exceptions` can be configured in an Appointment Type. It can be used to restrict the availabilities for the particular type. E.g. to configure to not accept appointments of the specific type on Mondays, or on every afternoon. A detailed description of the [**Opening Hours** format can be found in the dedicated section of this document](#opening-hours).                                            |
| `maxConcurrentAppointments` | number, integer            | the maximum number of concurrent appointments that can be set for the specific Appointment Type. If the `maxConcurrentAppointments` is already set at Calendar-level, then this property can be used only to narrow that value (and not to increase it). E.g., if Calendar `maxConcurrentAppointments` property is set to 10, the Appointment Type can specify a smaller value and not a bigger one. In any case, the smaller of the two will be finally used. |
| `settings`                  | (optional) object          | settings object, depending on the appointment _macro-type_, Online or External, read more below in this section                                                                                                                                                                                                                                                                                                                                                |

---

##### Appointment Type Settings

In case of an Appointment Type of `online` type, `settings` are the following:

| PROPERTY          | VALUE                       | DESCRIPTION                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tags`            | (optional) array of strings | an array of tags (currently not used)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `exclusiveAgents` | (optional) array of strings | an array of exclusive agents Ids (currently not used)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `emailConfig`     | (optional) an object        | Email configuration for the particular Appointment Type. **If specified, it overrides the Calendar `email` configuration**. Likewise the [Calendar Email Configuration](#email-configuration), it is an object with the following properties: `senderAddress`, `ccAddresses` (optional), `bccAddresses` (optional) and `template` (optional). If `template` property is specified, then it is an object that can have two main properties: 1) `templateName`, mandatory, is an object with the following properties (all optional): `customerNewAppointment`, `customerCancelAppointment`, `agentNewAppointment` (currently not used), `agentCancelAppointment` (currently not used), `customerRemindAppointment`, `customerLandingRemindAppointment`, `agentRemindAppointment` (currently not used). Each of these properties are object with a language string as a key (e.g., `en`, `it`), and a corresponding registered AWS SES template name. If a template is not configured for a given calendar language, then english is used. 2) `templateData` (optional), an object representing the data to be sent in emails and must match the data keys referenced by AWS SES registered templates (currently not used). |
| `landingPageUrl`  | (optional) string           | URL of the appointment landing/joining page for customers, if specified it overrides that specific property in Calendar configuration                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `actionHandlers`  | (optional) object           | the properties of this configuration objects represents URL of external endpoints that, if set, the Vivocha Appointments Scheduler will call in HTTP POST for every step in the Appointment lifecycle, to eventually notify an external system. Properties are (all optional): `setupURL`, URL string to call in POST when an external Appointment is created; `cancelURL`: the URL to call in POST when a customer cancels an Appointment; `rescheduleURL`, the URL to call when an appointment is re-scheduled (currently not used)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

---

In case of an Appointment Type of `external` type, `settings` are the following, instead:

| PROPERTY          | VALUE                       | DESCRIPTION                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tags`            | (optional) array of strings | an array of tags (currently not used)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `exclusiveAgents` | (optional) array of strings | an array of exclusive agents Ids (currently not used)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `emailConfig`     | (optional) an object        | Email configuration for the particular Appointment Type. **If specified, it overrides the Calendar `email` configuration**. Likewise the [Calendar Email Configuration](#email-configuration), it is an object with the following properties: `senderAddress`, `ccAddresses` (optional), `bccAddresses` (optional) and `template` (optional). If `template` property is specified, then it is an object that can have two main properties: 1) `templateName`, mandatory, is an object with the following properties (all optional): `customerNewAppointment`, `customerCancelAppointment`, `agentNewAppointment` (currently not used), `agentCancelAppointment` (currently not used), `customerRemindAppointment`, `customerLandingRemindAppointment`, `agentRemindAppointment` (currently not used). Each of these properties are object with a language string as a key (e.g., `en`, `it`), and a corresponding registered AWS SES template name. 2) `templateData` (optional), an object representing the data to be sent in emails and must match the data keys referenced by AWS SES registered templates (currently not used). |
| `location`        | (optional) object           | Appointment location data, read more below in this section                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `actionHandlers`  | (optional) object           | the properties of this configuration objects represents URL of external endpoints that, if set, the Vivocha Appointments Scheduler will call in HTTP POST for every step in the Appointment lifecycle, to eventually notify an external system. Properties are (all optional): `setupURL`, URL string to call in POST when an external Appointment is created; `cancelURL`: the URL to call in POST when a customer cancels an Appointment; `rescheduleURL`, the URL to call when an appointment is re-scheduled (currently not used)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

---

**About Action Handlers**: If set, the Appointments Scheduler calls the configured URLs corresponding to some of the steps in the Appointment lifecycle. It does it in the following way:

- doing a HTTP **`POST`** to configured URL
- with **JSON body**:
  - on appointment creation: `{ event: 'new', id: <appointment__id>, code: <appointment_code>, type: <appointment_type>, timezone: <appointment_timezone || calendar_timezone || 'Europe/Rome', calendarId: <appointment_calendarId>, fromDate: <UTC-ISO 8601 start date-time>, toDate: <UTC-ISO 8601 end date-time> }`;
  - on appointment cancelling: `{ event: 'cancel', id: <appointment__id>, code: <appointment_code>, type: <appointment_type>, timezone: <appointment_timezone || calendar_timezone || 'Europe/Rome', calendarId: <appointment_calendarId>, fromDate: <UTC-ISO 8601 start date-time>, toDate: <UTC-ISO 8601 end date-time> }`.

###### Appointment Location Settings

Being an external appointment based on a physical location or place, the Appointment Type `location` setting defines the properties in the next table. In this case, location data is also used in emails sent to customers.

| PROPERTY        | VALUE             | DESCRIPTION                                                                              |
| --------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| `name`          | string            | name of the place / location                                                             |
| `latitude`      | (optional) number | latitude                                                                                 |
| `longitude`     | (optional) number | longitude                                                                                |
| `googlePlaceId` | (optional) string | Google Place Id, if set it will be used instead of address in the Vivocha default emails |
| `countryCode`   | (optional) string | country code                                                                             |
| `countryName`   | (optional) string | name of the country                                                                      |
| `region`        | (optional) string | region name                                                                              |
| `address`       | string            | address of the place                                                                     |
| `city`          | string            | city name                                                                                |

---

## Appointment

An Appointment represents a "meeting" between an agent and a customer. In case of an _online_ Appointment Type, that meeting is by an "online" landing. When the Appointment types is _external_, then it refers to a physical "de visu" meeting in a well defined place/location.
Once created and set, an Appointment has the following properties:

| PROPERTY         | VALUE                     | DESCRIPTION                                                                                                       |
| ---------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `_id`            | string                    | unique id of the appointment                                                                                      |
| `acct_id`        | string                    | Vivocha account id                                                                                                |
| `type`           | string                    | Appointment Type name, on the the Appointment Types' name defined in a Calendar                                   |
| `calendarId`     | string                    | Id of the Calendar which the appointment belongs to                                                               |
| `campaignId`     | (optional) string         | Id of the Campaign through which the appointment has been created and set                                         |
| `conversationId` | (optional) string         | id of the conversation through which the appointment has been created and set                                     |
| `summary`        | string                    | summary of the appointment                                                                                        |
| `description`    | (optional) string         | free text                                                                                                         |
| `timezone`       | (optional) string         | [IANA timezone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) of the created appointment          |
| `fromDate`       | Date                      | Starting UTC Date Time of the appointment                                                                         |
| `toDate`         | Date                      | Ending UTC Date Time of the appointment (`fromDate` + `duration`)                                                 |
| `duration`       | (optional) integer number | duration of the appointment, in minutes                                                                           |
| `code`           | string                    | unique, generated Appointment Code                                                                                |
| `context`        | object                    | Appointment context data, it depends on the _macro-type_: `online` or `external`. Read more below in this section |
| `state`          | (optional) object         | object representing the current state of the appointment. See **Appointment State** section below                 |
| `ts`             | string                    | Appointment creation Date Time in ISO-8601 format, UTC                                                            |

---

### Appointment Context

The Appointment `context` is an object with different properties depending on the _macro-type_.

An _Online Appointment Context_ has the following properties:

| PROPERTY          | VALUE                       | DESCRIPTION                                                                                                                                                                                                    |
| ----------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`            | string                      | type of the appointment, set to `online`                                                                                                                                                                       |
| `contactId`       | (optional) string           | Id of the contact created (if created) for the Appointment (currently not used)                                                                                                                                |
| `tags`            | (optional) array of strings | a list of tags (currently not used)                                                                                                                                                                            |
| `exclusiveAgents` | (optional) array of strings | a list of exclusiveAgents (currently not used)                                                                                                                                                                 |
| `data`            | object                      | a set of collected data, including (optional) `name` of the customer and mandatory `email` address. It should be included other collected data (for example from a data collection), with string property keys |

An _External Appointment Context_ has the following properties:

| PROPERTY   | VALUE             | DESCRIPTION                                                                                                                                                                                                    |
| ---------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`     | string            | type of the appointment, set to `external`                                                                                                                                                                     |
| `data`     | object            | a set of collected data, including (optional) `name` of the customer and mandatory `email` address. It should be included other collected data (for example from a data collection), with string property keys |
| `location` | (optional) object | Appointment Location object, as defined in Appointment Type                                                                                                                                                    |

---

## Appointment Data Encryption

The Appointments Scheduler automatically encrypts all the appointments context data, which may contain sensitive data.
Only the appointment `context.data` property is encrypted before storing it, and it is automatically decrypted when accessed, for example by calling an API endpoint.

---

### Appointment State

After an Appointment has been created and set, it has a set of properties that represents its current state.

| PROPERTY          | VALUE                       | DESCRIPTION                                                                                                                                                                                                                                                                                                                                     |
| ----------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ongoing`         | (optional) boolean          | true, if it is an ongoing appointment                                                                                                                                                                                                                                                                                                           |
| `complete`        | (optional) boolean          | true, if it is a completed appointment                                                                                                                                                                                                                                                                                                          |
| `agentMissed`     | (optional) boolean          | true, if the agent missed the appointment (currently not used)                                                                                                                                                                                                                                                                                  |
| `customerMissed`  | (optional) boolean          | true, if the customer missed the appointment, in other words she/he was in late (currently not used)                                                                                                                                                                                                                                            |
| `expired`         | (optional) boolean          | true, if the appointment is not valid anymore (currently not used)                                                                                                                                                                                                                                                                              |
| `cancelled`       | (optional) object           | an object that gives info in case the appointment has been cancelled. Its properties are `by`, string among `customer`, `agent`, or `script`, who cancelled the appointment; optional `id`, agent or customer id that cancelled the appointment; optional `ts`: timestamp about when the appointment was cancelled                              |
| `rescheduled`     | (optional) object           | (currently not used) an object that gives info in case the appointment has been rescheduled. Its properties are `by`, string among `customer`, `agent`, or `script`, who rescheduled the appointment; optional `id`, agent or customer id that rescheduled the appointment; optional `ts`: timestamp about when the appointment was rescheduled |
| `scheduledEvents` | (optional) array of strings | a list of events id scheduled for this appointment. For example: id of the events related to emails to be sent                                                                                                                                                                                                                                  |

---

## API

The Appointments Scheduler API is divided into two sets: the **Calendar API** and the **Appointment API**, which in turn contain the **private endpoints** and the **public endpoints**.

> **IMPORTANT: ALL dates in API call responses are UTC based and in a valid date-time ISO 8601 format. ALL dates in API requests MUST BE UTC based and in ISO 8601 format, always.** > **IMPORTANT: requests that require a JSON body, must set the HTTP request header `Content-Type: application/json`**

Some API endpoints **have limitations** (i.e., listing endpoints) on the number of returned resources. Where explicitely written, then you must use pagination to retrieve all the resources you need.

The API endpoints return standard HTTP status codes and, in some cases, a JSON body in case of error.

### RQL Queries

The API endpoints that explicitely support RQL queries, expose the following **URL query parameter**:

**`q`**: string, a Resource Query Language (RQL) command in string format. Included to execute a query following the RQL specification. The RQL query string **MUST be URI encoded** and must follow the RQL specification.

For example:

`?q=eq(name,appointment%20one)`: return a list of appointments with name equal to `appointment one`

`?q=matches(name,one)`: return a list of appointments where the name contains the word `one`, used here as a regular expression.

### Pagination

The API endpoints that explicitely support pagination (like listing operations, usually), expose what follows:

#### Pagination URL Query Parameters

**`limit`**: integer number to limit the number of results to return. Default limit is now set to `50`;

**`skip`**: integer, the number of elements to skip in the returned list of results; used with the `limit` parameter it allows to paginate the results. The response HTTP headers below return info about pagination.

Examples:

```sh
?limit=10&skip=10
```

```sh
?limit=20&skip=40
```

```sh
?limit=30&skip=90
```

#### Pagination HTTP Response Headers

**`Results-Matching`**: the total number of elements matching the query (as if no limit is set);

**`Results-Skipped`**: the number of skipped elements resulting from applying the `skip` parameter value;

**`Link`**: the direct API endpoint URL to get the "next page" of elements.

### CSV Format

Some API endpoints allows to list resources (like Calendars and Appointments) using the CSV format, instead of JSON. The endpoints that explicitely support CSV export, sport the following **URL query parameter**.

#### CSV URL Query Parameters

**`format=csv`**: this query parameter enables the export in CSV format, its value is always set to `csv` and MUST BE used in conjunction with the `csv_fields` parameter;

**`csv_fields`**: mandatory for CSV format, it is an array of resource fields to include in the csv. Please note that object type properties cannot be displayed. Use `.` to include their single property fields. E.g.: csv_fields=summary,code,context.type;

**`csv_names`**: CSV custom field names, an array to modify the names of the exported csv fields;

**`csv_options`**: an array of options. The available csv options are the following:

- `unwind`: unwind array field with specified name. E.g., `unwind=anArrayField`
- `separator`: field separator character (default: ","). E.g., `separator=;`
- `decimal`: decimal separator character (default: "."). E.g., `decimal=,`
- `eol`: End-of-line character sequence
- `dateFormat`: Format date according to pattern (see [this doc](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) for details)
- `timezone`: Format times according to timezone (e.g. Europe/Rome)
- `header`: boolean, include header with field names
- `quotes`: boolean, quote all values
- `filename`: strng, download as filename. E.g., `filename=appointments.csv`.

**Example of a query string containing an export in csv**:

`?format=csv&csv_fields=code,summary,context.type&csv_names=Code,Summary,Context Type&csv_options=header=true,separator=;,filename=appointments.csv`

**Another example of a query string containing an export in csv specifying `state.cancelled` object properties**:

`?format=csv&csv_fields=code,summary,context.type,state.cancelled.by,state.cancelled.ts&csv_names=Code,Summary,Context Type,Cancelled by,Cancelled at&csv_options=header=true,separator=;,filename=appointments.csv`

> **IMPORTANT: if an optional property is not included in the appointment record, then its field value in the csv file will result as an empty cell in the csv column.**

---

### Calendar API

The Calendar API allows to manage Calendars and perform actions on them.

**Private endpoints are authenticated**.

Base URL for private endpoints: `https://{vivocha-world}.vivocha.com/a/{account}/api/v3`

Base URL for public endpoints: `https://{vivocha-world}.vivocha.com/a/{account}/api/v3/public`

All API endpoints accept JSON bodies, when applicable. Most of them return responses in JSON format, when applicable and where not explicitely documented.
Full, parsable, API documentation is always available in OpenAPI 3.x format at URLs:

`https://{vivocha-world}.vivocha.com/a/{account}/api/v3/openapi.json`

`https://{vivocha-world}.vivocha.com/a/{account}/api/v3/public/openapi.json`

> **IMPORTANT: all dates in API call responses are UTC based and in a valid date-time ISO 8601 format. All dates in API requests MUST BE UTC based and in ISO 8601 format, always.** >**IMPORTANT: requests that require a JSON body, must set the HTTP request header `Content-Type: application/json`**

#### Calendar Private Endpoints

##### GET `/calendars`

Get a list of Calendars.

This endpoint also supports [RQL Queries](#rql-queries), [Pagination](#pagination) and [CSV export](#csv-format) URL query parameters.

---

##### POST `/calendars`

Create a new Calendar.

Example of JSON body:

```json
{
  "name": "New ABC Bank Calendar",
  "description": "New ABC Bank Calendar test",
  "media": "chat",
  "timezone": "Europe/Rome",
  "language": "en",
  "company": "New ABC National Bank",
  "configuration": {
    "maxConcurrentAppointments": 8,
    "availabilityHours": {
      "intervals": [
        {
          "dayOfWeek": {
            "from": 1,
            "to": 5
          },
          "hours": {
            "from": 9,
            "to": 17
          }
        },
        {
          "dayOfMonth": {
            "from": 28,
            "to": 28
          },
          "month": {
            "from": 5,
            "to": 5
          },
          "year": {
            "from": 2021,
            "to": 2021
          },
          "hours": {
            "from": 9,
            "to": 17
          },
          "minutes": {
            "from": 15
          }
        }
      ],
      "exceptions": [
        {
          "dayOfMonth": {
            "from": 12,
            "to": 13
          },
          "month": {
            "from": 5,
            "to": 5
          },
          "year": {
            "from": 2021,
            "to": 2021
          }
        },
        {
          "dayOfMonth": {
            "from": 16,
            "to": 16
          },
          "month": {
            "from": 5,
            "to": 5
          },
          "year": {
            "from": 2021,
            "to": 2021
          },
          "hours": {
            "from": 9,
            "to": 13
          }
        },
        {
          "dayOfMonth": {
            "from": 26,
            "to": 26
          },
          "month": {
            "from": 5,
            "to": 5
          },
          "year": {
            "from": 2021,
            "to": 2021
          },
          "hours": {
            "from": 9,
            "to": 13
          }
        },
        {
          "dayOfMonth": {
            "from": 27,
            "to": 27
          },
          "month": {
            "from": 5,
            "to": 5
          },
          "year": {
            "from": 2021,
            "to": 2021
          }
        }
      ]
    },
    "email": {
      "senderAddress": "mobile@vivocha.com",
      "template": {
        "online": {
          "templateName": {
            "customerNewAppointment": {
              "en": "VivochaDefaultTemplateEN",
              "it": "VivochaDefaultTemplateIT"
            },
            "customerCancelAppointment": {
              "en": "VivochaDefaultCancelledTemplateEN",
              "it": "VivochaDefaultCancelledTemplateIT"
            },
            "customerRemindAppointment": {
              "en": "VivochaDefaultCustRemindTemplateEN",
              "it": "VivochaDefaultCustRemindTemplateIT"
            },
            "customerLandingRemindAppointment": {
              "en": "VivochaDefaultCustLandingRemindTemplateEN",
              "it": "VivochaDefaultCustLandingRemindTemplateIT"
            }
          }
        },
        "external": {
          "templateName": {
            "customerNewAppointment": {
              "en": "ExternalDefaultTemplateEN",
              "it": "ExternalDefaultTemplateIT"
            },
            "customerCancelAppointment": {
              "en": "ExternalDefaultCancelledTemplateEN",
              "it": "ExternalDefaultCancelledTemplateIT"
            },
            "customerRemindAppointment": {
              "en": "ExternalDefaultCustRemindTemplateEN",
              "it": "ExternalDefaultCustRemindTemplateIT"
            },
            "customerLandingRemindAppointment": {
              "en": "ExternalDefaultCustLandingRemindTemplateEN",
              "it": "ExternalDefaultCustLandingRemindTemplateIT"
            }
          }
        }
      }
    },
    "webTemplates": {
      "appointmentCancelled": {
        "en": "Your appointment has been successfully cancelled. You will receive a confirmation email very soon. Thank you.",
        "it": "Il tuo appuntamento è stato cancellato, riceverai una email di conferma al più presto. Grazie."
      },
      "appointmentAlreadyCancelled": {
        "en": "Appointment already cancelled or completed.",
        "it": "Appuntamento già cancellato o completato."
      }
    },
    "landingPageUrl": "https://myline.vivocha.com/l/en/areariservata"
  },
  "appointmentTypes": [
    {
      "name": "Accounting",
      "type": "online",
      "description": "Account services",
      "color": "#4287f5",
      "timezone": "Europe/Rome",
      "duration": 30,
      "paddingAfter": 5,
      "isActive": true,
      "maxConcurrentAppointments": 2
    },
    {
      "name": "Money Transfer",
      "type": "online",
      "description": "Payments services",
      "color": "#f57960",
      "timezone": "Europe/Rome",
      "duration": 40,
      "paddingAfter": 5,
      "isActive": true,
      "maxConcurrentAppointments": 3
    },
    {
      "name": "Loans",
      "type": "online",
      "description": "Loans info",
      "color": "#098765",
      "timezone": "Europe/Rome",
      "duration": 120,
      "paddingAfter": 5,
      "isActive": true,
      "maxConcurrentAppointments": 2,
      "availabilityHours": {
        "exceptions": [
          {
            "dayOfWeek": {
              "from": 1,
              "to": 1
            }
          }
        ]
      }
    },
    {
      "name": "Credit Cards",
      "type": "online",
      "description": "Credit and Debit cards",
      "color": "#098765",
      "timezone": "Europe/Rome",
      "duration": 120,
      "paddingAfter": 5,
      "isActive": true,
      "maxConcurrentAppointments": 2,
      "availabilityHours": {
        "exceptions": [
          {
            "dayOfWeek": {
              "from": 1,
              "to": 1
            }
          }
        ]
      }
    },
    {
      "name": "Milan Offices",
      "type": "external",
      "description": "External Service MI",
      "color": "#098765",
      "timezone": "Europe/Rome",
      "duration": 60,
      "paddingAfter": 5,
      "isActive": true,
      "maxConcurrentAppointments": 4,
      "availabilityHours": {
        "exceptions": [
          {
            "dayOfWeek": {
              "from": 5,
              "to": 5
            }
          }
        ]
      },
      "settings": {
        "location": {
          "name": "Covisian HQ Milano",
          "latitude": 45.5004000552936,
          "longitude": 9.2284390454376,
          "address": "Via Valtorta, 45, 20127",
          "city": "Milano (MI)"
        }
      }
    },
    {
      "name": "Turin Offices",
      "type": "external",
      "description": "External Service Covisian TO",
      "color": "#098765",
      "timezone": "Europe/Rome",
      "duration": 60,
      "paddingAfter": 5,
      "isActive": true,
      "maxConcurrentAppointments": 1,
      "availabilityHours": {
        "exceptions": [
          {
            "dayOfWeek": {
              "from": 2,
              "to": 2
            }
          }
        ]
      },
      "settings": {
        "location": {
          "name": "Covisian Torino",
          "latitude": 45.1099096165107,
          "longitude": 7.67131732714931,
          "address": "Via Paolo Veronese, 250, 10148",
          "city": "Torino (TO)"
        }
      }
    }
  ],
  "enabled": true
}
```

---

##### GET `/calendars/{id}`

Get a specific Calendar in JSON.

If `format` query parameter is used and set to `ical`, then the Calendar will be returned in iCalendar format, including the not already completed appointments set in the specified dates interval.

Available query parameters are:

`format=ical`: if specified return the Calendar in iCal format. In that case use the `from` and `to` parameters to specify a time range to include appointments set in; or, `offsetPast` and `offsetFuture` query params can be used as day-based offsets to specify the range. For example `offsetFuture` can replace the to parameter and can be used with `from` to set a range of days. If only `offsetFuture` and `offsetPast` are defined, then the range starts from `now - offsetPast` until `now + offsetFuture`, expressed in days. Remember: `from`, `to`, `offsetPast` and `offsetFuture` query params **cannot be used all together**;

`from`: UTC ISO 8601 date string to include appointments set starting from that date;

`to`: UTC ISO 8601 date string to including appointments set before that date;

`offsetPast`: positive integer, number of days to subtract to the `from` param as the start date to get the Calendar events. If `from` is not specified then days will be subtracted to the current _now_ date and hour. Used only when `format=ical`;

`offsetFuture`: positive integer, number of days to add to the `from` param as the end date to which get the Calendar events. If `from` is not specified then days will be added to the current _now_ date and hour. **Cannot be used with the `to` parameter**. Used only when `format=ical`;

`padding`: optional, if set to `true`, include padding in events total duration in the returned iCalendar format; total duration of the event will be event duration + padding. This parameter takes effect only when `format` parameter is set to `ical`. If set to false or not specified, then the event doesn't include the padding in the iCalendar format

---

##### PUT `/calendars/{id}`

Edit/update a Calendar. Body must be a full Calendar JSON, like in POST (create) request.

---

##### PATCH `/calendars/{id}`

Update single properties of a Calendar.

> **IMPORTANT: doing a PATCH to an entire property of object type is NOT recommended and in some cases is NOT permitted.**
>
> Example of a body request:

```json
[
  {
    "op": "replace",
    "path": "/name",
    "value": "PATCHED TEST CREATE Calendar"
  },
  {
    "op": "replace",
    "path": "/description",
    "value": "PATCHED TEST CREATE Calendar description"
  }
]
```

Another example, referencing an array item (an Appointment Type to change the `paddingAfter` property value, in this case):

```json
[
  {
    "op": "replace",
    "path": "/appointmentTypes/0/paddingAfter",
    "value": 10
  }
]
```

---

##### DELETE `/calendars/{id}`

Delete a Calendar.

---

##### GET `/calendars/{id}/actions/get-ical-url`

Return an object containing the Calendar complete URL endpoint to be used to download it in iCalendar format, or to be used to subscribe to the Calendar by a Calendar application client.
The returned URL contains a `token` parameter already set.

This endpoint **DOES NOT** accept any query parameter and it returns a JSON like the following:

```json
{
  "url": "https://www.vivocha.com/.../.../calendars/..."
}
```

---

##### GET `/calendars/{id}/actions/is-slot-available?appointmentType=<appointment-type-name>&startDate=<UTC-start-date>`

Returns an object containing a `isAvailable` boolean property. It is `true` if the specified slot start date for a given appointment type is available; `false` otherwise.

The is-slot-available algorithm takes into consideration the appointment type and the start date of the slot to be checked.

Mandatory query params are the following:

`appointmentType`: the Appointment Type name, as defined in the Calendar, to check if the slot is available;

`startDate`: the date to to check if the slot is available. It MUST be in UTC and in ISO 8601 format; `startDate` can't be a date-time in the past. If the provided ISO 8601 date string refers to a date in the past then UTC now date is used as start date, automatically.

This endpoint returns a JSON like the following:

```json
{
  "isAvailable": true
}
```

---

##### Availabilities

The following endpoint allows to know the available slots in a Calendar, given an Appointment Type. The availabilities algorithm takes into consideration the already scheduled appointments, the appointment type, dates, days and configured availability hours.

The current version the availabilities algorithm works as follows:

- the starting date is the specified one, if it is in the present or future; otherwise, if it is in the past, then UTC _now_ is automatically used, instead;
- the minimum days of calculation is 1;
- the maximum days of calculation is 15;
- if starting date refers to the current (_now_) date and hour, if minutes are > 0, then it starts from the same day, next hour;
- it partitions the day in slots having the same height, equal to the appointment duration (+ padding after value, if specified);
- finally, it excludes the slots which already have the relative maximum number of concurrent appointments, or they don't satisfy the availabilityHours; if a slot is rejected, next processed slot will be the one after previous slot's _start date + duration + (padding after, if set)_;
- valid, resulting, available slots are returned for the number of specified days.

##### GET `/calendars/{id}/availabilities?appointmentType=<appointment-type-name>&startDate=<UTC-start-date>&days=<days>`

Get a JSON object with availabilities.

**Mandatory** query params are the following:

`appointmentType`: the Appointment Type name, as defined in the Calendar, to get availaibilities for;

`startDate`: the date to start computing availabilities from. It MUST be in UTC and in ISO 8601 format; `startDate` can't be a date-time in the past. If the provided ISO 8601 date string refers to a date in the past then UTC now date is used as start date, automatically;

`days`: the number of days, including the day in `startDate` param, to include in availabilities computing; **Allowed maximum number of days is 15** per API call. If you need to compute the availabilities for more than consecutive 15 days, then change `startDate` and `days` params accordingly, to do a sort of availabilities "pagination".

The endpoint returns an array of available time slots that can be used to create an Appointment of the specified type.

Following, an example of request:

`GET https://{world}.vivocha.com/a/vvcdev/api/v3/calendars/{calendarId}/availabilities?appointmentType=Service%20VVC-A&startDate=2021-05-08T07:00Z&days=3`

And an example of response:

```json
[
  {
    "from": "2021-05-10T07:00:00.000Z",
    "to": "2021-05-10T07:30:00.000Z"
  },
  {
    "from": "2021-05-10T07:30:00.000Z",
    "to": "2021-05-10T08:00:00.000Z"
  },
  {
    "from": "2021-05-10T08:00:00.000Z",
    "to": "2021-05-10T08:30:00.000Z"
  },

  ...

  {
    "from": "2021-05-10T11:30:00.000Z",
    "to": "2021-05-10T12:00:00.000Z"
  },
  {
    "from": "2021-05-10T12:00:00.000Z",
    "to": "2021-05-10T12:30:00.000Z"
  },
  {
    "from": "2021-05-10T12:30:00.000Z",
    "to": "2021-05-10T13:00:00.000Z"
  },

  ...

  {
    "from": "2021-05-10T14:30:00.000Z",
    "to": "2021-05-10T15:00:00.000Z"
  },
  {
    "from": "2021-05-11T07:00:00.000Z",
    "to": "2021-05-11T07:30:00.000Z"
  }
]
```

If the specified `appointmentType` parameter refers to an Appointment Type which has the `paddingAfter` property set, then the returned availabilities slots include also the `paddingAfter` property, like in the following example:

```json
[
  {
    "from": "2021-06-24T14:00:00.000Z",
    "to": "2021-06-24T14:30:00.000Z",
    "paddingAfter": 10
  },
  {
    "from": "2021-06-25T07:00:00.000Z",
    "to": "2021-06-25T07:30:00.000Z",
    "paddingAfter": 10
  },
  {
    "from": "2021-06-25T07:40:00.000Z",
    "to": "2021-06-25T08:10:00.000Z",
    "paddingAfter": 10
  },

  ...
]
```

---

##### Get Appointments

Retrieve a list of JSON appointments set in the referenced Calendar.

##### GET `/calendars/{id}/appointments[?fromDate=<start-date>&toDate=<end-date>&complete=<boolean>]`

Return a list of appointments.
The available, optional, query params are the following:

`fromDate`: UTC, ISO 8601 date string to start from in retrieving appointments; Default will be UTC now (at time of the call);

`toDate`: UTC, ISO 8601 date string to end retrieving appointments; Appointments set over this date are excluded from the listing;

`complete`: include also already completed appointments; Default is false, it returns only not yet completed ones.

This endpoint also supports [RQL Queries](#rql-queries), [Pagination](#pagination) and [CSV export](#csv-format) URL query parameters.

---

#### Calendar Public Endpoints

##### GET `/calendars/{id}?format=ical`

Get a Calendar in iCalendar format, only.

This endpoint requires a valid `token` parameter. To get the endopoint URL with a valid token, it must be called the `/calendars/{id}/actions/get-ical-url` API endpoint (see [Calendar API Private Endpoints](#calendar-private-endpoints)).

Available query parameters are:

`format=ical`: mandatory, and it must be set to `ical`. Use the `from` and `to` parameters to specify a time range to include appointments set in; or, `offsetPast` and `offsetFuture` query params can be used as day-based offsets to specify the range. For example `offsetFuture` can replace the to parameter and can be used with `from` to set a range of days. If only `offsetFuture` and `offsetPast` are defined, then the range starts from `now - offsetPast` until `now + offsetFuture`, expressed in days. Remember: `from`, `to`, `offsetPast` and `offsetFuture` query params **cannot be used all together**;

`token`: mandatory, authorization token, call the `/calendars/{id}/actions/get-ical-url` API endpoint to obtain it, along with the complete Calendar URL to call (see [Calendar API Private Endpoints](#calendar-private-endpoints));

`from`: optional, UTC ISO 8601 date string to include appointments set starting from that date; if parameter isn't provided, then UTC _now_ is used;

`to`: optional, UTC ISO 8601 date string to including appointments set before that date; if parameter isn't provided, `to` is computed as `from + 1 month`;

`offsetPast`: optional, positive integer. The number of days to subtract to the `from` param as the start date to get the Calendar events. If `from` is not specified then days will be subtracted to the current _now_ date and hour. Used only when `format=ical`;

`offsetFuture`: optional, positive integer. The number of days to add to the `from` param as the end date to which get the Calendar events. If `from` is not specified then days will be added to the current _now_ date and hour. **Cannot be used with the `to` parameter**. Used only when `format=ical`;

`padding`: optional, if set to `true`, include padding in events total duration in the returned iCalendar format; total duration of the event will be event duration + padding. If set to false or not specified, then the event doesn't include the padding in the iCalendar format;

`complete`: optional, if set to `true`, include also already completed appointments in the returned iCalendar. If set to false or not specified, then already completed appointments are not included.

> **IMPORTANT: Use of iCalendar web clients is not recommended as they have a non-configurable refresh rate, set in many cases to 12-24h, which is not a suitable scenario to be always updated about the appointments. Please, use a non-web client app for better user experience.**

---

### Appointment API

The Appointment API allows to manage Appointments and actions on them.
Private endpoints are authenticated.

Base URL for private endpoints: `https://{vivocha-world}.vivocha.com/a/{account}/api/v3`

Base URL for public endpoints: `https://{vivocha-world}.vivocha.com/a/{account}/api/v3/public`

All API endpoints accept JSON bodies, when applicable. Most of them return responses in JSON format, when applicable and where not explicitely documented.
Full, parsable, API documentation is always available in OpenAPI 3.x format at URLs:

`https://{vivocha-world}.vivocha.com/a/{account}/api/v3/openapi.json`

`https://{vivocha-world}.vivocha.com/a/{account}/api/v3/public/openapi.json`

> **IMPORTANT: all dates in API call responses are UTC based and in a valid date-time ISO 8601 format. All dates in API requests MUST BE UTC based and in ISO 8601 format, always.** >**IMPORTANT: API requests that require a JSON body, must set the HTTP request header `Content-Type: application/json`**

#### Appointment Private Endpoints

##### GET `/appointments`

Returns a paginated list of appointments related to the specified account.

This endpoint also supports [RQL Queries](#rql-queries), [Pagination](#pagination) and [CSV export](#csv-format) URL query parameters.

---

##### POST `/appointments[?sendEmails=true|false]`

Create a new Appointment.

The available, optional, query parameter is the following:

`sendEmails`: to send or not the emails to the customer about the new appointment. Admitted values are `true` and `false`. Default is `true`, emails are sent.

To create an Appointment the JSON body MUST include the following properties:

| PROPERTY         | VALUE             | DESCRIPTION                                                                                                                                                 |
| ---------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`           | string            | name of the Appointment Type, as defined in the referenced Calendar                                                                                         |
| `calendarId`     | string            | id of the referenced Calendar                                                                                                                               |
| `campaignId`     | (optional) string | id of the current Vivocha Campaign                                                                                                                          |
| `conversationId` | (optional) string | id of the conversation                                                                                                                                      |
| `summary`        | string            | Appointment summary                                                                                                                                         |
| `description`    | string            | Appointment description, free text                                                                                                                          |
| `fromDate`       | string            | Appointment start date based on UTC and in ISO 8601 format                                                                                                  |
| `timezone`       | (optional) string | [IANA Timezone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)                                                                               |
| `context`        | object            | Appointment Context, different in case it is under creation a Online or an External Appointment. See **Appointment Context** section above in this document |

Examples of create an Appointment JSON body contents follows.

###### JSON body to create a new _online_ appointment

```json
{
  "calendarId": "609...6dd",
  "timezone": "Europe/Rome",
  "fromDate": "2021-05-10T11:00Z",
  "summary": "A Vivocha Appointment",
  "description": "A user reports a bricked computer after an update",
  "type": "Service VVC-A",
  "context": {
    "type": "online",
    "data": {
      "name": "Antonio Rossi",
      "email": "rossi@blablablabla.com"
    }
  }
}
```

##### JSON body to create a new _External_ appointment

```json
{
  "calendarId": "60914a...48b6dd",
  "timezone": "Europe/Rome",
  "fromDate": "2021-05-13T11:00Z",
  "summary": "Documentation Delivery",
  "description": "An external appointment",
  "type": "Service Ext-MI",
  "context": {
    "type": "external",
    "data": {
      "name": "Antonio Rossi",
      "email": "rossi@okokokok.com"
    }
  }
}
```

---

##### PATCH `/appointments/{id}`

Update specific properties of an Appointment.

> **IMPORTANT: doing a PATCH to an entire property of object type (e.g., context or state) is NOT recommended and in some cases is NOT permitted.**

##### JSON body to patch an appointment

```json
[
  {
    "op": "replace",
    "path": "/context/data",
    "value": {
      "email": "rossi@blablablabla.com",
      "name": "test patch 5",
      "company": "Super Company",
      "team": "dev team",
      "microteam": "dev"
    }
  },
  {
    "op": "replace",
    "path": "/summary",
    "value": "An edited appoiintment"
  }
]
```

---

##### GET `/appointments/{id}`

Get an appointment.

---

##### DELETE `/appointments/{id}[?sendEmails=true|false]`

Cancel and delete an Appointment.

The available, optional, query parameter is the following:

`sendEmails`: to send or not the emails to the customer about the cancelled appointment. Admitted values are `true` and `false`. Default is `true`, emails are sent.

---

##### Actions

##### POST `/appointments/{id}/actions/cancel[?sendEmails=true|false]`

Cancel an Appointment.
The available, optional, query parameter is the following:

`sendEmails`: to send or not the emails to the customer about the cancelled appointment. Admitted values are `true` and `false`. Default is `true`, emails are sent.

---

#### Appointment Public Endpoints

The following endpoints are intended to be sent and used by email to the customer.

These endpoints always require a query param named `token`, which must be set with the token generated by Vivocha, included in emails, for example.

##### DELETE `/appointments/{id}`

Cancel an Appointment.

---

##### GET `/appointments/{id}/actions/cancel`

Cancel an Appointment.

---

##### GET `/appointments/{id}/actions/complete`

Complete an Appointment.

---

##### GET `/appointments/{id}/actions/ical`

Get an Appointment in iCal format.

---

##### GET `/appointments/{id}/actions/landing`

Land to/join an Appointment.

---

##### GET `/appointments/{id}/actions/check-status`

Return the status for an Appointment for a user joining it.
The status is checked against the current time of the call and it returns a status according to user's early, ok, or late compared to the start/end date of the Appointment + configured validities.

It returns an object like the following:

```json
{
  "res": "<status>"
}
```

where `status` is a string that can be one of the following values: `OK`, `EARLY`, `LATE`, `CANCELLED`, or `COMPLETE`.

---

## Stats API

The Stats API allows to get statistics about Appointments and Calendars.

Only private endpoints are available. These endpoints are authenticated.

Base URL for private endpoints: `https://{vivocha-world}.vivocha.com/a/{account}/api/v3`

All API endpoints accept JSON bodies, when applicable. Most of them return responses in JSON format, when applicable and where not explicitely documented. Full, parsable, API documentation is always available in OpenAPI 3.x format at URLs:

`https://{vivocha-world}.vivocha.com/a/{account}/api/v3/openapi.json`

> **IMPORTANT: all dates in API call responses are UTC based and in a valid date-time ISO 8601 format. All dates in API requests MUST BE UTC based and in ISO 8601 format, always.** > **IMPORTANT: requests that require a JSON body, must set the HTTP request header `Content-Type: application/json`**

### Stats Private Endpoints

#### GET `/appointments-stats/general`

Without any query param it returns general stats for all the Appointments taken by a specified account.
Available query params are the following:

`fromDate`: optional, the Appointment slot start date to get stats from. It MUST be in UTC and in ISO 8601 format. It refers to the `fromDate` Appointment property.

`toDate`: optional, the Appointment slot end date to end getting stats. It MUST be in UTC and in ISO 8601 format. It refers to the `endDate` Appointment property.

`fromTs`: optional, the Appointment creation date to get stats from. It MUST be in UTC and in ISO 8601 format. It refers to the `ts` Appointment property.

`toTs`: optional, the Appointment creation date to end getting stats. It MUST be in UTC and in ISO 8601 format. It refers to the `ts` Appointment property.

`calendarId`: optional, id of the Calendar which the appointment belongs. If specified, the endpoint returns stats about the Appointments belonging to that Calendar..

> **IMPORTANT: date properties should be used consistently. Use `fromDate` and `toDate` properties OR `fromTs` and `toTS`. Do not mix any of those properties.**

This endpoint returns a JSON, like the following:

```json
{
  "total": 30,
  "completed": 13,
  "cancelled": {
    "total": 9,
    "byCustomer": 4,
    "byAgent": 5
  },
  "ongoing": 17
}
```

Where:

`total`: total number of the appointments set in the given interval. It is the sum of the completed and the ongoing appointments.

`completed`: total number of the completed appointments. Completed appointments include cancelled appointments, too.

`cancelled`: an object that contains stats aboyt cancelled appointments, by customers and/or by agents and their sum (`total`). A cancelled appointment is a also a completed appointment, with details about the cancellation.

`ongoing`: ongoing appointments; In other words: Appointments set that aren't completed. Or, the difference between the number of total appointments and the number of completed ones.

## Interaction Engine Blocks

The Vivocha Interaction Engine has three new blocks dedicated to the Appointments Scheduler.

Moreover, it is possible to change the current calendar to be used by the following blocks. It is possible to read the current Calendar Id accessing the `calendar.id` script context property.

Setting that property in a _SetData Block_ with another Calendar Id, results in changing the Calendar for the current conversation. Obviously, the starting Calendar Id is the one linked to the referenced Campaign, if set.

### Get Appointment Types

This block (_get-appointment-types_) reads the Calendar linked to the current Campaign, and saves in the configured `temp.<tempName>` context property an array of strings containing the Appointment Types names, as defined in the Calendar. If `tempName` is not configured, the list of Appointment Types names is saved in `temp.appointmentTypes` context property. Then, the returned list of strings can be used to let customers choose a type of Appointment to book.

### Get Availabilities

This block (_get-availabilities_), given the Calendar configured in the current Campaign and its configuration, computes all the available time slots for a particular Appointment Type, saving them in the configured `temp.<tempName>` context property. If `tempName` is not configured, the computed availabilities are saved in `temp.availabilities` context property.

The other block settings to configure are the following:

`appointmentType`: required, the data source (const value or a context data property) where to get the Appointment Type name as a string;

`fromDate`: optional, the data source (const value or a context data property) where to get the starting date to compute time slots availabilities. The `fromDate` must be a valid **UTC date string in ISO 8601 format**. If not specified, tha starting date will be set to the first next hour after the _now_ (date-time at the moment that the block is executed). If configured, and also the `startIn` setting is set, this property have precedence over `startIn` that will be ignored.

`startIn`: optional, used by the system only if the `fromDate` setting is not set, it allows to specify a time point in the future from the "_current now_" to start the availabilities computation. This setting is a string in the following format:
`<amount>[m | h | d]`, where:

- `<amount>` is an integer number >= 1
- `m` means _minutes_, then the resulting computation start date will be: _now + `amount` minutes_
- `h` means _hours_, then the resulting computation start date will be: _now + `amount` hours_
- `d` means _days_, then the resulting computation start date will be: _day of now + `amount` days_ but starting at the beginning of the day.

#### Examples

- `45m`: now + 45 minutes
- `48h`: now + 48 hours
- `6d`: now + 6 days at time 00:00:000

`days`: required, the data source (const value or a context data property) where to get the number of days (starting from and including the day in `fromDate`) to compute the time slots availabilities for the chosen Appointment Type. **Allowed maximum number of days is 15**, if you need to compute availabilities for more days you must repeat block execution changing the `startIn` and `days` parameters.

As written above, the computed availabilities are stored in the `temp.<tempName>` or `temp.availabilities` context property, and they are an **array** of objects as follows:

```javascript
{
  from: "<start date as ISO 8601 string in the calendar/appointment type timezone>",
  fromUTC: "<start date as ISO 8601 string in UTC>",
  formatted: "<start date string formatted using the calendar/appointment type timezone and contact language>",
  timezone: "<string about IANA Timezone used>",
  tzOffset: "<number as Timezone offset in minutes>"
}
```

### Set Appointment

Given a date-time slot, this block (_set-appointment_) creates a new Appointment in the Calendar.
If, during the potentially concurrent Appointment creation, the date-time slot isn't longer available, the block exits through the configured `dateNotAvailable` output.

This block accepts the following settings:

`tempName`: optional, the context temp data slot name to save the created appointment data, if successful;

`appointmentType`: required, the data source (const value or a context data property) where to get the Appointment Type name as a string;

`summary`: required, a summary string about the Appointment, it can include templates;

`description`: optional, a description string about the Appointment, it can include templates;

`fromDate`: required, the data source (const value or a context data property) where to get the starting date as UTC ISO 8601 string of the Appointment;

`timezone`: optional, the data source (const value or a context data property) where to get the timezone of the Appointment, if not specified it is automatically retrieved from Calendar;

`name`: optional, the data source (const value or a context data property) where to get the full name string of the customer/prospect booking the appointment;

`email`: required, the data source (const value or a context data property) where to get the email address of the customer/prospect booking the appointment;

`includeDataCollection`: required, boolean to indicate if include current data collection in the Appointment data or not;

`tags`: optional (**currently not used**), data source (const value or a context data property) where to get routing tags;

`exclusiveAgents`: optional (**currently not used**), data source (const value or a context data property) where to get exclusive agents ids.

If the appointment creation and setup are successful, then the new appointment data is saved to the `temp.<tempName>` context property or, if `tempName` setting is not specified, data is saved to `temp.appointment` script context data slot.
The saved appointment data is an object with the following properties:

```javascript
{
  id: "<string id>",
  type: "<appointment type string>",
  summary: "<string, appointment summary>",
  description: "<string, appointment description, if set>",
  timezone: "<string, timezone of the appointment, if set>",
  fromDate: "<appointment start date, UTC based, ISO 8601 date-time string>",
  toDate: "<appointment end date, UTC based, ISO 8601 date-time string>",
  duration: "<number, the duration of the appointment>",
  code: "<appointment unique code>"
}
```

In case of an _External_ Appointment, the saved data object has also the `location` property, set to the location of the appointment, if available.
The `location` property is an object like the following:

```javascript
{
  name: "<location name, string>",
  latitude: "<number>",
  longitude: "<number>",
  googlePlaceId: "<string>",
  countryCode: "<string>",
  countryName: "<string>",
  region: "<string>",
  address: "<string>",
  city: "<string>"
}
```

## Opening Hours

Vivocha Opening Hours is an object that allows you to define when a support center is open and active. This operation can be done defining a list of time intervals and specifying, if necessary, a list of exceptions (when the support center is not available).

The OpeningHours object has the following properties:

| PROPERTY     | VALUE                              | DESCRIPTION                                                         |
| ------------ | ---------------------------------- | ------------------------------------------------------------------- |
| `intervals`  | (optional) array of `TimeInterval` | List of opening hours intervals expressed in `TimeInterval` format. |
| `exceptions` | (optional) array of `TimeInterval` | List of exception intervals expressed in `TimeInterval` format.     |

### TimeInterval

`TimeInterval` can be defined specifing `hours` and `minutes` properties (for days); days of the week (`dayOfWeek`), days of the month (`dayOfMonth`), months and years.

| PROPERTY     | VALUE                    | DESCRIPTION                                                                                                                                                                                                                                                                                                                                                                     |
| ------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hours`      | (optional) ValueInterval | The starting and the ending hours of the days. To include a whole day interval, simply exclude the hours property from the interval. However this practice is not recommended, it's a good practice, and a more effective way to set hours, specifying the precise range of hours that are really useful, depending on the business case; for example: 9-18, 8-17, and so on... |
| `minutes`    | (optional) ValueInterval | Specifies the starting and the ending minutes related to the previously defined hours in the `hours` property. Must be used in conjunction with the `hours` property.                                                                                                                                                                                                           |
| `dayOfWeek`  | (optional) ValueInterval | The interval of the week.                                                                                                                                                                                                                                                                                                                                                       |
| `dayOfMonth` | (optional) ValueInterval | Days of the month                                                                                                                                                                                                                                                                                                                                                               |
| `month`      | (optional) ValueInterval | Months of the year starting from 1 (January) to 12 (December).                                                                                                                                                                                                                                                                                                                  |
| `year`       | (optional) ValueInterval | Years included in the interval                                                                                                                                                                                                                                                                                                                                                  |

All of these properties are optional and expressed in `ValueInterval` format that describes a time interval that has a beginning and an end. A `ValueInterval` object has the following properties:

| PROPERTY | VALUE             | DESCRIPTION               |
| -------- | ----------------- | ------------------------- |
| `from`   | (optional) number | The start of the interval |
| `to`     | (optional) number | The end of the interval   |

The interval of the week `dayOfWeek` indicates the number of the day as follows:

| Value | Description         |
| ----- | ------------------- |
| 1     | Indicates Monday    |
| 2     | Indicates Tuesday   |
| 3     | Indicates Wednesday |
| 4     | Indicates Thursday  |
| 5     | Indicates Friday    |
| 6     | Indicates Saturday  |
| 7     | Indicates Sunday    |

If no `TimeInterval`property is defined, opening hours are always valid, thus the support center is always open. When a property is not defined is implied that the value of that property is the maximum interval property.

For example if you want to set this opening hours: _every day from 9:00 to 17:00_, then the `intervals` array must contain a single `TimeInterval` object like the following:

```json
{
  "intervals": [
    {
      "hours": {
        "from": 9,
        "to": 17
      }
    }
  ]
}
```

### Some Examples

#### Hours

_An interval from monday to friday from 9:00 to 17:00:_

```json
{
  "intervals": [
    {
      "dayOfWeek": {
        "from": 1,
        "to": 5
      },
      "hours": {
        "from": 9,
        "to": 17
      }
    }
  ]
}
```

#### Minutes

_An interval from 9:15 to 18:30:_

```json
{
  "intervals": [
    {
      "hours": {
        "from": 9,
        "to": 18
      },
      "minutes": {
        "from": 15,
        "to": 30
      }
    }
  ]
}
```

#### Days of week

_An interval from monday to friday:_

```json
{
  "intervals": [
    {
      "dayOfWeek": {
        "from": 1,
        "to": 5
      }
    }
  ]
}
```

#### Days of Month

_An interval from the 12th to the 23th day (included) of the month:_

```json
{
  "intervals": [
    {
      "dayOfMonth": {
        "from": 12,
        "to": 23
      }
    }
  ]
}
```

#### Months

The following example shows an interval _'from January to June'_:

```json
{
  "intervals": [
    {
      "month": {
        "from": 1,
        "to": 6
      }
    }
  ]
}
```

#### Years

_'An interval from 2021 to 2022'_ defining the `year` property:

```json
{
  "intervals": [
    {
      "year": {
        "from": 2021,
        "to": 2022
      }
    }
  ]
}
```

_An interval from January to May only for the year 2021:_

```json
{
  "intervals": [
    {
      "month": {
        "from": 1,
        "to": 5
      },
      "year": {
        "from": 2021,
        "to": 2021
      }
    }
  ]
}
```

### An Opening Hours Complete JSON Example

The following example defines the opening hours of a support center opened _from monday to Friday from 9:15 to 17:30. The support center is closed during these intervals_ (`exceptions`):

- _on June 2nd (every year)_

- _on June 16th of 2023 from 9:00 to 13:00_
- _from 22nd to 31st December from 13:15 to 17:30_
- _on 1st of every month of the year 2023_

```json
{
  "intervals": [
    {
      "dayOfWeek": {
        "from": 1,
        "to": 5
      },
      "hours": {
        "from": 9,
        "to": 17
      },
      "minutes": {
        "from": 15,
        "to": 30
      }
    }
  ],
  "exceptions": [
    {
      "dayOfMonth": {
        "from": 2,
        "to": 2
      },
      "month": {
        "from": 6,
        "to": 6
      }
    },
    {
      "dayOfMonth": {
        "from": 16,
        "to": 16
      },
      "month": {
        "from": 6,
        "to": 6
      },
      "year": {
        "from": 2023,
        "to": 2023
      },
      "hours": {
        "from": 9,
        "to": 13
      }
    },
    {
      "dayOfMonth": {
        "from": 22,
        "to": 31
      },
      "month": {
        "from": 12,
        "to": 12
      },
      "hours": {
        "from": 13,
        "to": 17
      },
      "minutes": {
        "from": 15,
        "to": 30
      }
    },
    {
      "dayOfMonth": {
        "from": 1,
        "to": 1
      },
      "year": {
        "from": 2023,
        "to": 2023
      }
    }
  ]
}
```

---

Feel free to report an error in this documentation, a typo, or missing documentation opening an issue in this repo.

Thank you.
