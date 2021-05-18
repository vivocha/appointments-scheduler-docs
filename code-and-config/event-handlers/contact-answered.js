function vvcCompleteAppointment(vvcURL, token) {
  try {
    const url = `${vvcURL}?token=${token}`;
    fetch(url).then((response) => {
      if (response.ok) {
        console.debug('Appointment complete.');
      } else {
        console.debug('unable to set Appointment as complete, request status:', response.status);
      }
      delete window.VIVOCHA_APPOINTMENT_COMPLETE;
    });
  } catch (error) {
    console.error('[ERR - vvcCompleteAppoitment] - ', error);
  }
}

const opts = window.VIVOCHA_APPOINTMENT_COMPLETE;
console.log('contact options -->', JSON.stringify(opts));
if (opts.completeUrl) {
  vvcCompleteAppointment(opts.completeUrl, opts.token);
}
