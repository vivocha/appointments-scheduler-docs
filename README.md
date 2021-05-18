# Vivocha Appointments Scheduler Technical and API Documentation

*version 1.0.0* - last edit: *18/05/2021*

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
- [Calendar API](#calendar-api)
  - [Private Endpoints](#calendar-private-endpoints)
  - [Public Endpoints](#calendar-public-endpoints)
- [Appointment API](#appointment-api)
  - [Private Endpoints](#appointment-private-endpoints)
  - [Public Endpoints](#appointment-public-endpoints)
- [Interaction Engine Blocks](#interaction-engine-blocks)

---
---

## Overview

The Appointments Scheduler is a module of the Vivocha platform which allows to set and manage appointments with customers. Appointments can be both online and "physical", location-based.

The Appointments Scheduler exposes a public and a private API, and also send emails to customers in different moments: to confirm the appointment, and two reminders.

The Appointments Scheduler is based on three main entities: *Calendar*, *Appointment Type* and *Appointment*, as shown in the next picture.

| ![Appointments Scheduler Main Entities](https://raw.githubusercontent.com/vivocha/appointments-scheduler-docs/master/img/overview.svg?token=ABCZNYU67KMLGBLI7DCM5IDAVT4UI&sanitize=true) |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                                               **FIGURE 1 - Appointments Scheduler Main Entities/Concepts**                                                               |

This repository is structured as follows:

- `code-and-config` folder contains an example of a Calendar, in JSON; the default AWS SES email templates used by the Appointments Scheduler; the Vivocha Campaign sample event-handlers, used in a demo integration, and a conversation script, used in the same demo;
- the `docs` folder contains a brief documentation about the scheduler integration done for demo purposes.

---

## Calendar and Appointment Types

The *Calendar* is the main entity of the Appointments Scheduler.
A Calendar represents a well-defined, configured container of Appointments.

A Calendar can be linked to several Vivocha Campaigns. A Vivocha Campaign can be linked to one and only one Calendar.

Along with several basic properties, like name, timezone, language, and so on..., a Calendar has a detailed configuration, and it also defines a set of  *Appointment Types*, which represents all the types of appointment that it is possible to book/set in the specific Calendar.
For example, a *Tax Consultancy* Calendar could define some Appointment Types like: *Private support*, *Company support*, and so on...
A Calendar can accept the booking of appointments only of the types it explicitely defines.

A Calendar can be exported and "read" by its *iCalendar* representation.

In the current version of the Appointments Scheduler, a Calendar has the following properties:

| PROPERTY           | VALUE                            | DESCRIPTION                                                                                                                                         |
| ------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_id`              | string                           | the Calendar Id                                                                                                                                     |
| `acct_id`          | string                           | Vivocha Account Id to which the calendar belongs                                                                                                    |
| `name`             | string                           | The name of the Calendar                                                                                                                            |
| `description`      | (optional) string                | free text description                                                                                                                               |
| `company`          | (optional) string                | The name of the company that will be also exported in the iCal format and eventually used in the emails sent to the customers. Default is `Vivocha` |
| `timezone`         | string                           | Timezone string in IANA format, like `Europe/Rome`                                                                                                  |
| `language`         | (optional) string                | Calendar language string, like `en`, `it`, `fr`. Default is `en`                                                                                    |
| `media`            | string                           | Calendar starting media, like `chat`                                                                                                                |
| `appointmentTypes` | array of AppointmentType objects | the appointment types that can be set in the specific Calendar, see dedicated section below                                                         |
| `configuration`    | object                           | the Calendar Configuration, see section below                                                                                                       |
---

### Calendar Configuration

Current version provides a static configuration of the Calendar.
Calendar Configuration properties follow:

| PROPERTY                    | VALUE                      | DESCRIPTION                                                                                                                                                                                                                                                                                               |
| --------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `availabilityHours`         | (optional) object          | defines the general availability (when an appointment can be set) days and hours of the Calendar, including exceptions (when an appointment can't be set). An AppointmentType can add its own availability exceptions. Availability Hours are in the same format as the Vivocha Campaingn's Opening Hours |
| `maxConcurrentAppointments` | (optional) number, integer | the maximum number of concurrent appointments that can be set in this calendar. Appointment Types can decrease the max concurrent number for a particular type of appointment                                                                                                                             |
| `tags`                      | (optional) array of string | Calendar tags (currently not used)                                                                                                                                                                                                                                                                        |
| `exclusiveAgents`           | (optional) array of string | a list of Vivocha Agents Ids (currently not used)                                                                                                                                                                                                                                                         |
| `email`                     | (optional) object          | configuration object for the emails to send to customers, see below in this section                                                                                                                                                                                                                       |
| `webTemplates`              | (optional) object          | strings to be shown to customers on a browser, for example when it cancels an appointment by a link in an email. Strings are set by language code. See below in the next sections                                                                                                                         |
| `landingPageUrl`            | (optional) string          | the URL of the page to redirect customers to join the online Vivocha appointment                                                                                                                                                                                                                          |
---

#### Email Configuration

The Appointments scheduler sends some emails to customers, in different moments:

- when the appointment is created and set, with links to download an iCal file and to cancel the appointment
- one hour before the appointment, as a reminder, with the option to cancel the appointment
- ten minutes before the appointment, as a reminder, with the option to cancel the appointment and, only in case of a Vivocha (online) appointment type, a link to join the appointment with an agent at the set date/hour.

The Appointments Scheduler uses AWS SES service to send the required emails, and they are based on templates. Thus, it is necessary, as a first step, to upload all the required custom AWS SES templates before configuring a Calendar, otherwise the Vivocha default templates will be automatically used to compose emails.

The Calendar Email configuration is based on the following properties:

| PROPERTY        | VALUE                       | DESCRIPTION                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `senderAddress` | string                      | Email address to use as sender. It MUST be previously verified by AWS SES before configuring it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `ccAddresses`   | (optional) array of strings | A list of email addresses to send emails in Cc                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `template`      | (optional) object           | Email templates configuration. It has two main properties: `templateName`, mandatory, is an object with the following properties (all optional): `customerNewAppointment`, `customerCancelAppointment`, `agentNewAppointment` (currently not used), `agentCancelAppointment` (currently not used), `customerRemindAppointment`, `customerLandingRemindAppointment`, `agentRemindAppointment` (currently not used). Each of these properties are object with a language string as a key (e.g., `en`, `it`), and a corresponding registered AWS SES template name. The `templateData` (optional) is an object representing the data to be sent in emails and must match the data keys referenced by AWS SES registered templates |

---

An example of email configuration, referencing the defaukt email templates is the following:

```json
"email" : {
    "senderAddress" : "mobile@vivocha.com",
    "template" : {
        "templateName" : {
            "customerNewAppointment" : {
                "en" : "VivochaDefaultTemplateEN"
            },
            "customerCancelAppointment" : {
                "en" : "VivochaDefaultCancelledTemplateEN"
            },
            "customerRemindAppointment" : {
                "en" : "VivochaDefaultCustRemindTemplateEN"
            },
            "customerLandingRemindAppointment" : {
                "en" : "VivochaDefaultCustLandingRemindTemplateEN"
            }
        }
    }
}
```

#### Web Templates

Web templates are the messages to be shown to the customer a the result of some actions. Currently, only the (optional) `appointmentCancelled` is supported, and it is rendered in the browser when the customer cancels the appointment by selecting the related link/button in a received email.
Subproperties keys are the language code, as in the following, default, example:

```json
"webTemplates" : {
    "appointmentCancelled" : {
        "en" : "Your appointment has been successfully cancelled. You will receive a confirmation email very soon. Thank you.",
        "it" : "Il tuo appuntamento è stato cancellato, riceverai una email di conferma al più presto. Grazie."
    }
}
```

#### Appointment Types

An Appointment Type is the definition of a type of an appointment that can be set in a specific Calendar.
Basically, the current version supports the definition of two "macro" types: appointments of *vivocha* type, and of *external* type. The former is an online appointment to happen through the Vivocha platform; the latter is a *de visu*, location-based appointment.

An Appointment Type defines several properties, summarized by the next table:

| PROPERTY                    | VALUE                      | DESCRIPTION                                                                                                                                                                                                                                                                         |
| --------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                      | string                     | the name of the type, MUST BE unique in the context of the same Calendar, it is used as its id                                                                                                                                                                                      |
| `type`                      | string                     | macro type, admitted values are: `vivocha` and `external`                                                                                                                                                                                                                           |
| `description`               | (optional) string          | a free text description                                                                                                                                                                                                                                                             |
| `image`                     | (optional) string          | URL of an image to associate to the appointment type                                                                                                                                                                                                                                |
| `color`                     | (optional) string          | Hex number string of the color to associate to the appointment type                                                                                                                                                                                                                 |
| `timezone`                  | (optional) string          | Timezone in IANA format for the specific Appointment Type, if not specified it will be used the one defined globally in the Calendar                                                                                                                                                |
| `duration`                  | number, integer            | the duration of the appointment, in minutes                                                                                                                                                                                                                                         |
| `paddingBefore`             | (optional) number, integer | extra time to take into consideration before the starting time of the appointment, in minutes (currently not used)                                                                                                                                                                  |
| `paddingAfter`              | (optional) number, integer | extra time to take into consideration after the end time of the appointment, in minutes (currently not used)                                                                                                                                                                        |
| `validity`                  | (optional) object          | validity represents the interval of time when an appointment joining/landing can be considered valid before considering the customer in late or too early. The validity object has the following optional two properties: `before` and `after`, both numbers, expressed in minutes. |
| `isActive`                  | (optional) boolean         | an Appointment type can be deactivated (currently not used)                                                                                                                                                                                                                         |
| `availabilityHours`         | (optional) object          | like the Calendar's availability hours but only `exceptions` can be configured in an Appointment Type. It can be used to restrict the availabilities for the particular type. E.g. to configure to not accept appointments of the specific type on Mondays, or on every afternoon.  |
| `maxConcurrentAppointments` | number, integer            | the maximum number of concurrent appointments that can be set for a specific type                                                                                                                                                                                                   |
| `settings`                  | (optional) object          | settings object, depending on the appointment macro type, Vivocha or External, read more below in this section                                                                                                                                                                      |

---

##### Appointment Type Settings

In case of an Appointment Type of `vivocha` type, `settings` are the following:

| PROPERTY          | VALUE                                                                | DESCRIPTION                                                                                                                           |
| ----------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `tags`            | (optional) array of strings                                          | an array of tags (currently not used)                                                                                                 |
| `exclusiveAgents` | (optional) array of strings                                          | an array of exclusive agents Ids (currently not used)                                                                                 |
| `emailConfig`     | (optional) object, same as Calendar's `email` configuration property | Email configuration, same as for calendar. If specified, it overrides the Calendar `email` configuration                              |
| `landingPageUrl`  | (optional) string                                                    | URL of the appointment landing/joining page for customers, if specified it overrides that specific property in Calendar configuration |
---

In case of an Appointment Type of `external` type, `settings` are the following, instead:

| PROPERTY          | VALUE                                                                | DESCRIPTION                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tags`            | (optional) array of strings                                          | an array of tags (currently not used)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `exclusiveAgents` | (optional) array of strings                                          | an array of exclusive agents Ids (currently not used)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `emailConfig`     | (optional) object, same as Calendar's `email` configuration property | Email configuration, same as for calendar. If specified, it overrides the Calendar `email` configuration                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `location`        | object                                                               | Appointment location data, read more below in this section                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `actionHandlers`  | (optional) object                                                    | the properties of this configuration objects represents URL of external endpoints that, if set, the Vivocha Appointments Scheduler will call in HTTP POST for every step in the Appointment lifecycle, to eventually notify an external system. Properties are (all optional): `setupURL`, URL string to call in POST when an external Appointment is created; `cancelURL`: the URL to call in POST when a customer cancels an Appointment; `rescheduleURL`, the URL to call when an appointment is re-scheduled (currently not used) |

---

**About Action Handlers**: If set, the Appointments Scheduler calls the configured URLs corresponding to some of the steps in the Appointment lifecycle. It does it in the following way:

- doing a HTTP **`POST`** to configured URL
- with **JSON body**:
  - on appointment creation: `{ event: 'new', code: <appointment_code>, fromDate: <UTC-ISO 8601 start date-time>, toDate: <UTC-ISO 8601 end date-time> }`;
  - on appointment cancelling: `{ event: 'cancel', code: <appointment_code>, fromDate: <UTC-ISO 8601 start date-time>, toDate: <UTC-ISO 8601 end date-time> }`.

###### Appointment Location Settings

Being an external appointment based on a physical location or place, the Appointment Type `location` setting defines the properties in the next table. In this case, location data is also used in emails sent to customers.

| PROPERTY        | VALUE             | DESCRIPTION                          |
| --------------- | ----------------- | ------------------------------------ |
| `name`          | string            | name of the place / location         |
| `latitude`      | (optional) number | latitude                             |
| `longitude`     | (optional) number | longitude                            |
| `googlePlaceId` | (optional) string | Google Place ID (currently not used) |
| `countryCode`   | (optional) string | country code                         |
| `countryName`   | (optional) string | name of the country                  |
| `region`        | (optional) string | region name                          |
| `address`       | string            | address of the place                 |
| `city`          | string            | city name                            |

---

## Appointment

An Appointment represents a "meeting" between an agent and a customer. In case of a Vivocha Appointment Type, that meeting is by an "online" landing. When the Appointment types is External, then it refers to a physical "de visu" meeting in a well defined place/location.
Once created and set, an Appointment has the following properties:

| PROPERTY         | VALUE                     | DESCRIPTION                                                                                              |
| ---------------- | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `_id`            | string                    | unique id of the appointment                                                                             |
| `acct_id`        | string                    | Vivocha account id                                                                                       |
| `type`           | string                    | Appointment Type name, on the the Appointment Types' name defined in a Calendar                          |
| `calendarId`     | string                    | Id of the Calendar which the appointment belongs to                                                      |
| `campaignId`     | string                    | Id of the Campaign through which the appointment has been created and set                                |
| `conversationId` | (optional) string         | id of the conversation through which the appointment has been created and set                            |
| `summary`        | string                    | summary of the appointment                                                                               |
| `description`    | (optional) string         | free text                                                                                                |
| `timezone`       | (optional) string         | IANA timezone of the created appointment                                                                 |
| `fromDate`       | Date                      | Starting UTC Date Time of the appointment                                                                |
| `toDate`         | Date                      | Ending UTC Date Time of the appointment (`fromDate` + `duration`)                                        |
| `duration`       | (optional) integer number | duration of the appointment, in minutes                                                                  |
| `code`           | string                    | unique, generated Appointment Code                                                                       |
| `context`        | object                    | Appointment context data, it depends on macro type, Vivocha or External. Read more below in this section |
| `state`          | (optional) object         | object representing the current state of the appointment. See **Appointment State** section below        |

---

### Appointment Context

The Appointment `context` is an object with different properties depending on the macro type.

A *Vivocha Appointment Context* has the following properties:

| PROPERTY          | VALUE                       | DESCRIPTION                                                                                                                                                                                                    |
| ----------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`            | string                      | type of the appointment, set to `vivocha`                                                                                                                                                                      |
| `contactId`       | (optional) string           | Id of the contact created (if created) for the Appointment (currently not used)                                                                                                                                |
| `type`            | string                      | type of the appointment: `vivocha` or `external`                                                                                                                                                               |
| `tags`            | (optional) array of strings | a list of tags (currently not used)                                                                                                                                                                            |
| `exclusiveAgents` | (optional) array of strings | a list of exclusiveAgents (currently not used)                                                                                                                                                                 |
| `data`            | object                      | a set of collected data, including (optional) `name` of the customer and mandatory `email` address. It should be included other collected data (for example from a data collection), with string property keys |

An *External Appointment Context* has the following properties:

| PROPERTY   | VALUE  | DESCRIPTION                                                                                                                                                                                                    |
| ---------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`     | string | type of the appointment, set to `external`                                                                                                                                                                     |
| `data`     | object | a set of collected data, including (optional) `name` of the customer and mandatory `email` address. It should be included other collected data (for example from a data collection), with string property keys |
| `location` | object | Appointment Location object, as defined in Appointment Type                                                                                                                                                    |

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

## Calendar API

The Calendar API allows to manage Calendars and actions on them.
Private endpoints are authenticated.

### Calendar Private Endpoints

Base URL: `https://{vivocha-world}.vivocha.com/a/{account}/api/v3`

All API endpoints accept JSON bodies, when applicable. Most of them return responses in JSON format, when applicable and where not explicitely documented.
Full, parsable, API documentation is always available in OpenAPI 3.x format at URL:

`https://{vivocha-world}.vivocha.com/a/{account}/api/v3/openapi.json`

>**IMPORTANT: all dates in API call responses are UTC based and in a valid date-time ISO 8601 format. All dates in API requests MUST BE UTC based and in ISO 8601 format, always.**

#### CRUD

##### GET `/calendars`

Get a list of Calendars.

##### POST `/calendars`

Create a new Calendar.

Example of JSON body:

```json
{
    "name" : "TEST CREATE NEW calendar",
    "description" : "TEST CREATE calendar",
    "media" : "chat",
    "timezone" : "Europe/Rome",
    "language" : "en",
    "company" : "Covisian",
    "configuration" : {
        "maxConcurrentAppointments" : 3,
        "availabilityHours" : {
            "intervals" : [ 
                {
                    "dayOfWeek" : {
                        "from" : 1,
                        "to" : 5
                    },
                    "hours" : {
                        "from" : 9,
                        "to" : 17
                    }
                }, 
                {
                    "dayOfMonth" : {
                        "from" : 28,
                        "to" : 28
                    },
                    "month" : {
                        "from" : 5,
                        "to" : 5
                    },
                    "year" : {
                        "from" : 2021,
                        "to" : 2021
                    },
                    "hours" : {
                        "from" : 9,
                        "to" : 17
                    },
                    "minutes" : {
                        "from" : 15
                    }
                }
            ],
            "exceptions" : [ 
                {
                    "dayOfMonth" : {
                        "from" : 12,
                        "to" : 13
                    },
                    "month" : {
                        "from" : 5,
                        "to" : 5
                    },
                    "year" : {
                        "from" : 2021,
                        "to" : 2021
                    }
                }, 
                {
                    "dayOfMonth" : {
                        "from" : 16,
                        "to" : 16
                    },
                    "month" : {
                        "from" : 5,
                        "to" : 5
                    },
                    "year" : {
                        "from" : 2021,
                        "to" : 2021
                    },
                    "hours" : {
                        "from" : 9,
                        "to" : 13
                    }
                }, 
                {
                    "dayOfMonth" : {
                        "from" : 26,
                        "to" : 26
                    },
                    "month" : {
                        "from" : 5,
                        "to" : 5
                    },
                    "year" : {
                        "from" : 2021,
                        "to" : 2021
                    },
                    "hours" : {
                        "from" : 9,
                        "to" : 13
                    }
                }, 
                {
                    "dayOfMonth" : {
                        "from" : 27,
                        "to" : 27
                    },
                    "month" : {
                        "from" : 5,
                        "to" : 5
                    },
                    "year" : {
                        "from" : 2021,
                        "to" : 2021
                    }
                }
            ]
        },
        "email" : {
            "senderAddress" : "mobile@vivocha.com",
            "template" : {
                "templateName" : {
                    "customerNewAppointment" : {
                        "en" : "VivochaDefaultTemplateEN"
                    },
                    "customerCancelAppointment" : {
                        "en" : "VivochaDefaultCancelledTemplateEN"
                    },
                    "customerRemindAppointment" : {
                        "en" : "VivochaDefaultCustRemindTemplateEN"
                    },
                    "customerLandingRemindAppointment" : {
                        "en" : "VivochaDefaultCustLandingRemindTemplateEN"
                    }
                }
            }
        },
        "webTemplates" : {
            "appointmentCancelled" : {
                "en" : "Your appointment has been successfully cancelled. You will receive a confirmation email very soon. Thank you.",
                "it" : "Il tuo appuntamento è stato cancellato, riceverai una email di conferma al più presto. Grazie."
            }
        },
        "landingPageUrl" : "https://myline.vivocha.com/l/en/areariservata"
    },
    "appointmentTypes" : [ 
        {
            "name" : "Service VVC-A",
            "type" : "vivocha",
            "description" : "Vivocha Service A",
            "color" : "#4287f5",
            "timezone" : "Europe/Rome",
            "duration" : 30,
            "paddingAfter" : 5,
            "isActive" : true,
            "maxConcurrentAppointments" : 3
        }, 
        {
            "name" : "Service VVC-B",
            "type" : "vivocha",
            "description" : "Vivocha Service B",
            "color" : "#f57960",
            "timezone" : "Europe/Rome",
            "duration" : 40,
            "paddingAfter" : 5,
            "isActive" : true,
            "maxConcurrentAppointments" : 3
        }, 
        {
            "name" : "Service VVC-C",
            "type" : "vivocha",
            "description" : "Vivocha Service C",
            "color" : "#098765",
            "timezone" : "Europe/Rome",
            "duration" : 120,
            "paddingAfter" : 5,
            "isActive" : true,
            "maxConcurrentAppointments" : 2,
            "availabilityHours" : {
                "exceptions" : [ 
                    {
                        "dayOfWeek" : {
                            "from" : 1,
                            "to" : 1
                        }
                    }
                ]
            }
        }, 
        {
            "name" : "Service Ext-MI",
            "type" : "external",
            "description" : "External Service Covisian MI",
            "color" : "#098765",
            "timezone" : "Europe/Rome",
            "duration" : 60,
            "paddingAfter" : 5,
            "isActive" : true,
            "maxConcurrentAppointments" : 4,
            "availabilityHours" : {
                "exceptions" : [ 
                    {
                        "dayOfWeek" : {
                            "from" : 5,
                            "to" : 5
                        }
                    }
                ]
            },
            "settings" : {
                "location" : {
                    "name" : "Covisian HQ Milano",
                    "latitude" : 45.5004000552936,
                    "longitude" : 9.2284390454376,
                    "address" : "Via Valtorta, 45, 20127",
                    "city" : "Milano (MI)"
                }
            }
        }, 
        {
            "name" : "Service Ext-TO",
            "type" : "external",
            "description" : "External Service Covisian TO",
            "color" : "#098765",
            "timezone" : "Europe/Rome",
            "duration" : 60,
            "paddingAfter" : 5,
            "isActive" : true,
            "maxConcurrentAppointments" : 1,
            "availabilityHours" : {
                "exceptions" : [ 
                    {
                        "dayOfWeek" : {
                            "from" : 2,
                            "to" : 2
                        }
                    }
                ]
            },
            "settings" : {
                "location" : {
                    "name" : "Covisian Torino",
                    "latitude" : 45.1099096165107,
                    "longitude" : 7.67131732714931,
                    "address" : "Via Paolo Veronese, 250, 10148",
                    "city" : "Torino (TO)"
                }
            }
        }
    ],
    "enabled" : true
}
```

##### GET `/calendars/{id}`

Get a specific Calendar in JSON.

If `format` query parameter is used and set to `iCal`, then the Calendar will be returned in iCal format, including the not already coompleted appointments set in the specified dates interval.

Available query parameters are:

`format=ical`: if specified return the Calendar in iCal format. In that case use `from` and `to` parameters to specify a time range to include appointments set in;

`from`: UTC ISO 8601 date string to include appointments set starting from that date;

`to`: UTC ISO 8601 date string to including appointments set before that date;

##### PUT `/calendars/{id}`

Edit/update a Calendar. Body must be a full Calendar JSON, like in POST (create) request.

##### PATCH `/calendars/{id}`

Update single properties of a Calendar.
Example of a body request:

```json
[
  {
    "op": "replace",
    "path" : "/name",
    "value" : "PATCHED TEST CREATE Calendar"
  },
  {
      "op": "replace",
      "path" : "/description",
      "value" : "PATCHED TEST CREATE Calendar description"
  }
]
```

##### DELETE `/calendars/{id}`

Delete a Calendar.

#### Availabilities

The following endpoint allows to know the available slots for a calendar, given an Appointment Type. The availabilities algorithm takes into consideration the already scheduled appointments, the appointment type, dates, days and configured availability hours.

##### GET `/calendars/{id}/availabilities?appointmentType=<appointment-type-name>&startDate=<UTC-start-date>&days=<days>`

Get a JSON object with availabilities.

**Mandatory** query params are the following:

`appointmentType`: the Appointment Type name, as defined in the Calendar, to get availaibilities for;

`startDate`: the date to start computing availabilities from. It MUST be in UTC and in ISO 8601 format;

`days`: the number of days, including the day in `startDate` param, to include in availabilities computing;

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

#### Get Appointments

Retrieve a list of JSON appointments set in the referenced Calendar.

##### GET `/calendars/{id}/appointments[?fromDate=<start-date>&toDate=<end-date>&complete=<boolean>]`

Return a list of appointments.
The available, optional, query params are the following:

`fromDate`: UTC, ISO 8601 date string to start from in retrieving appointments; Default will be UTC now (at time of the call);

`fromDate`: UTC, ISO 8601 date string to end retrieving appointments; Appointments set over this date are excluded from the listing;

`complete`: include also already completed appointments; Default is false, it returns only not yet completed ones.

### Calendar Public Endpoints

#### GET `/calendars/{id}?format=ical`

Get a Calendar in iCal format, only.

Available query parameters are:

`format=ical`: mandatory and it must be set to `ical`. Use optional `from` and `to` parameters to specify a time range to include appointments set in;

`from`: UTC ISO 8601 date string to include appointments set starting from that date;

`to`: UTC ISO 8601 date string to including appointments set before that date;

---

## Appointment API

### Appointment Private Endpoints

#### CRUD

##### GET `/appointments`

Returns a paginated list of appointments related to the specified account.

##### POST `/appointments`

Create a new Appointment.

To create an Appointment the JSON body MUST include the following properties:

| PROPERTY         | VALUE             | DESCRIPTION                                                                                                                                                  |
| ---------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type`           | string            | name of the Appointment Type, as defined in the referenced Calendar                                                                                          |
| `calendarId`     | string            | id of the referenced Calendar                                                                                                                                |
| `campaignId`     | string            | id of the current Vivocha Campaign                                                                                                                           |
| `conversationId` | (optional) string | id of the conversation                                                                                                                                       |
| `summary`        | string            | Appointment summary                                                                                                                                          |
| `description`    | string            | Appointment description, free text                                                                                                                           |
| `fromDate`       | string            | Appointment start date based on UTC and in ISO 8601 format                                                                                                   |
| `timezone`       | (optional) string | IANA Timezone                                                                                                                                                |
| `context`        | object            | Appointment Context, different in case it is under creation a Vivocha or an External Appointment. See **Appointment Context** section above in this document |

Examples of create an Appointment JSON body contents follows.

###### JSON body to create a new *Vivocha* appointment**

```json
{  
  "calendarId": "609...6dd",
  "campaignId": "5e95bd...e54",
  "timezone": "Europe/Rome",
  "fromDate": "2021-05-10T11:00Z",
  "summary":"A Vivocha Appointment",
  "description":"A user reports a bricked computer after an update",
  "type": "Service VVC-A",
  "context": {
    "type": "vivocha",
    "data":{
      "name":"Antonio Rossi",
      "email":"rossi@blablablabla.com"
    }
  }
}
```

###### JSON body to create a new *External* appointment**

```json
{  
  "calendarId": "60914a...48b6dd",
  "campaignId": "5e95...2e54",
  "timezone": "Europe/Rome",
  "fromDate": "2021-05-13T11:00Z",
  "summary":"Documentation Delivery",
  "description":"An external appointment",
  "type": "Service Ext-MI",
  "context": {
    "type": "external",
    "data":{
      "name":"Antonio Rossi",
      "email":"rossi@okokokok.com"
    }
  }
}
```

##### GET `/appointments/{id}`

Get an appointment.

##### DELETE `/appointments/{id}`

Cancel and delete an Appointment.

#### Actions

##### POST `/appointments/{id}/actions/cancel`

Cancel an Appointment.

### Appointment Public Endpoints

The following endpoints are intended to be sent and used by email to the customer.

These endpoints always require a query param named `token`, wich must be set with the token generate by Vivocha, included in emails, for example.

#### DELETE `/appointments/{id}`

Cancel an Appointment.

#### GET `/appointments/{id}/actions/cancel`

Cancel an Appointment.

#### GET `/appointments/{id}/actions/complete`

Complete an Appointment.

#### GET `/appointments/{id}/actions/ical`

Get an Appointment in iCal format.

#### GET `/appointments/{id}/actions/landing`

Land to/join an Appointment.

#### GET `/appointments/{id}/actions/check-status`

Return the status for an Appointment for a user joining it.
The status is checked against the current time of the call and it returns a status according to user's early, ok, or late compared to the start/end date of the Appointment + configured validities.

It returns an object like the following:

```json
{
  "res": "<status>"
}
```

where `status` is a string that can be one of the following values: `OK`, `EARLY`, `LATE`, `CANCELLED`, or `COMPLETE`.

## Interaction Engine Blocks

The Vivocha Interaction Engine has three new blocks dedicated to the Appointments Scheduler.

### Get Appointment Types (get-appointment-types)

This block reads the Calendar linked to the current Campaign, and saves in the configured `temp.<tempName>` context property a list of strings containing the Appointment Types names, as defined in the Calendar. Then, the returned list of strings can be used to let customer choose a type of Appointment to book.

### Get Availabilities (get-availabilities)

This block, given the Calendar configured in the current Campaign and its configuration, computes all the available time slots for a particular Appointment Type, saving them in the configured `temp.<tempName>` context property.

The other block settings to configure are the following:

`appointmentType`: required, the data source (const value or a context data property) where to get the Appointment Type name as a string;

`fromDate`: optional, the data source (const value or a context data property) where to get the starting date to compute time slots availabilities. The `fromDate` must be a valid **UTC date string in ISO 8601 format**. If not specified, tha starting date will be set to the first next hour after the _now_ (date-time at the moment that the block is executed). If configured, and also the `startIn` setting is set, this property have precedence over `startIn` that will be ignored.

`startIn`: optional, used by the system only if the `fromDate` setting is not set, it allows to specify a time point in the future from the "*current now*" to start the availabilities computation. This setting is a string in the following format:
`<amount>[m | h | d]`, where:

- `<amount>` is an integer number >= 1
- `m` means *minutes*, then the resulting computation start date will be: *now + <amount> minutes*
- `h` means *hours*, then the resulting computation start date will be: *now + <amount> hours*
- `d` means *days*, then the resulting computation start date will be: *day of now + <amount> days* but starting at the beginning of the day.

#### Examples

- `45m`: now + 45 minutes
- `48h`: now + 48 hours
- `6d`: now + 6 days at time 00:00:000

`days`: required, the data source (const value or a context data property) where to get the number of days (starting from and including the day in `fromDate`) to compute the time slots availabilities for the chosen Appointment Type.

As written above, the computed availabilities are stored in the `temp.<tempName>` context property and they are an **array** of objects as follows:

```javascript
{
  from: "<start date as ISO 8601 string in the calendar/appointment type timezone>",
  fromUTC: "<start date as ISO 8601 string in UTC>",
  formatted: "<start date string formatted using the calendar/appointment type timezone and contact language>",
  timezone: "<string about IANA Timezone used>",
  tzOffset: "<number as Timezone offset in minutes>"
}
```

### Set Appointment (set-appointment)

Given a date-time slot, this block creates a new Appointment in the Calendar.
If, during the potentially concurrent Appointment creation, the date-time slot isn't longer available, the block exists through the configured `dateNotAvailable` output.

This block accepts the following settings:

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
