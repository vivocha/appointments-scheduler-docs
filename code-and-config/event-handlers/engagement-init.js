function startService() {
  window._VIVOCHA_AUTO_START_CHAT = true;
  vivocha.manager.checkRules();
}

function vvcVerifyAppointment(vvcURL, token) {
  console.debug('vvcCheckURL:', vvcURL);
  try {
    const url = `${vvcURL}?token=${token}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log('appointment status:', data.res);
        switch (data.res) {
          case 'OK':
            startService();
            break;
          case 'EARLY':
            alert('You are EARLY, please connect at time of the appointment');
            break;
          case 'CANCELLED':
            alert('Appointment has been cancelled');
            break;
          case 'LATE':
            alert("I'm sorry but you are IN LATE and you missed the appointment");
            break;
        }
      });
  } catch (error) {
    console.error('vvcVerifyAppointment', error);
  }
}

if (window.location.href.includes('myline.vivocha.com/l/en/areariservata')) {
  console.debug('Appointment Landing page... checking appointment status');
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams && urlParams.get('vvcCheck') && urlParams.get('vvcComplete') && urlParams.get('token')) {
    const vvcCheckUrl = window.atob(urlParams.get('vvcCheck'));
    const vvcCompleteUrl = window.atob(urlParams.get('vvcComplete'));
    // set to contact context
    window.VIVOCHA_APPOINTMENT_COMPLETE = { completeUrl: vvcCompleteUrl, token: urlParams.get('token') };
    vvcVerifyAppointment(vvcCheckUrl, urlParams.get('token'));
  } else {
    console.debug('Appointment Landing page... no params in url');
  }
}
