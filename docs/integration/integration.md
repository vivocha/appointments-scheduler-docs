# First Appointments Scheduler Integration Minimal Guide

v.2.0.0, 11/01/2022

---

## Components

First Vivocha **Appointments Scheduler** integration test involves the following components:

- A **Calendar configured for a Campaign**, the Campaign must have a `calendarId` set for an already created Calendar, for example see Calendar in file `/code-and-config/calendar/calendar.json`
- A single **Campaign** with two **entrypoints** and two different **widgets**, one with a **proactive rule**, a **variable**, a **data collection**, two **Event Handlers**
- A **Conversation Script**: see file `/code-and-config/interaction-scripts/appointments-scheduler.json`

## Install and Deploy

### 3. In the Campaign Builder, enable conversations and upload and use the Conversation Script

The Conversation Script file to upload, publish and use in the campaign is `/code-and-config/interaction-scripts/appointments-scheduler.json`.

The script is able to handle the booking process AND also the customer appointment landing.
The script will check if the customer is in "appointment landing", if true it will route the contact to agents; if not, it will manage the entire appointment booking process.

### 4. Using the `vvc` tool, push and enable the Auto Start Widget

**Auto Start Widget** can be found as project from `https://github.com/vivocha/ps-WIDGET-autochat.git`.

Clone and push and enable it:

```sh
vvc widget push -a
```

### 5. In the campaign, create two endpoints with two widgets respectively linked

The first entrypoint is configured to manage the Appointments Booking process, just use one and configure it to show on a particular web page.

The second entrypoint is for the appointment landing, by the customer. Configure it as follows:

- set it to appear in a particular website page, the landing page. The other widget should not appear in this page;
- associate the **Auto Chat Widget**
- for the **Auto Chat Widget**, create a proactive rule in AND set to `VIVOCHA_AUTO_START_CHAT equal to true`

### 6. Create variables in library

Create `VIVOCHA_AUTO_START_CHAT` variable of type boolean set by a JavaScript code, as follows:

```javascript
!!window._VIVOCHA_AUTO_START_CHAT;
```

Create `appointmentLanding` variable, of type boolean, set by a JavaScript code, as follows

```javascript
!!window.location.href.includes(<LANDING_PAGE_URL>);
```

The  `<LANDING_PAGE_URL>` is the URL of the landing page, where the customer can join the appointment and the Auto Start Widget will automagically start the conversation related to the appointment, if the customer is in time.
The same URL **MUST** be set in the **Calendar DB document** in the **Calendar.configuration.landingPageUrl** property.

### 7. Create data collection in library, for landing

Name it `AppointmentLandingDC`, set a boolean field named `isLandingFromAppointment`. The field value must be initialized using auto-filling from variable `appointmentLanding`.

The data collection will be used by the conversation script to check if customer is in landing page or not.

### 8. Add Event Handlers to Campaign

Add two inline-code based event handlers to the campaign:

The former is for the `engagement-init` event, enter the code contained in file `/code-and-config/event-handlers/engagement-init.js`;

The latter is for the `contact-answered` event, just enter the code in file `/code-and-config/event-handlers/contact-answered.js`.
