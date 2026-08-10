

// Select:
const sendBtn = document.getElementById('send-otp-btn'),
    aadhaarIp = document.getElementById('aadhaar'),
    resendBtn = document.getElementById('resend-otp-btn'),
    verifyBtn = document.getElementById('verify-otp-btn'),
    otpSection = document.querySelector('.otp-section'),
    statusMsg = document.getElementById('status-msg'),
    otpIp = document.getElementById('otp'),
    form = document.getElementById('auth-form');

// Init: Latitude & Longitude
const coords = { lat: null, lon: null };

// UX: Block typing non-digits
aadhaarIp.addEventListener('input', () => aadhaarIp.value = aadhaarIp.value.replace(/\D/g, ''));
otpIp.addEventListener('input', () => otpIp.value = otpIp.value.replace(/\D/g, ''));

// Inform users to allow their location access beforehand
statusMsg.textContent = "For authentication purposes, we'll ask your location access before we send you OTP 😊";

// Send OTP to Phone
sendBtn.addEventListener('click', async e => {
    // I/p Valid Aadhaar No. then disable btn
    const aadhaar = aadhaarIp.value.trim();
    if (!/^\d{12}$/.test(aadhaar)) {
        statusMsg.textContent = 'Aadhaar must be exactly 12 digits 🙂';
        return;
    }
    sendBtn.disabled = true;

    // Fetch user's coords
    statusMsg.textContent = "Fetching your location...😊";
    if (!navigator.geolocation) {
        statusMsg.textContent = 'Geolocation unsupported! Try another browser/device 😊';
        return;
    }
    const { lat, lon } = await new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            err => {
                switch (err.code) {
                    case 1:
                        statusMsg.textContent = 'For location verification, kindly allow location access 😊';
                        break;
                    case 2:
                        statusMsg.textContent = "We're unable to fetch your location. Please try again...😕";
                        break;
                    case 3:
                        statusMsg.textContent = 'Location request timed out. Please try again...⏳';
                        break;
                    default:
                        statusMsg.textContent = 'Unable to determine your location 😕';
                }
                resolve({ lat: null, lon: null });
            },
            {
                timeout: 20_000,
                enableHighAccuracy: true
            }
        );
    });
    coords.lat = lat; coords.lon = lon;
    if (isNaN(coords.lat) || isNaN(coords.lon)) return;

    // Verify user's location, Check Records & Send OTP
    statusMsg.textContent = "Verifying your details and location...😊";
    const sendOTP = await fetch('send-otp', {
        method: 'POST',
        body: JSON.stringify({ aadhaar, lat: coords.lat, lon: coords.lon }),
        headers: { 'Content-Type': 'application/json' }
    }), data = await sendOTP.json();

    // Display msg during OTP failure & enable btn
    if (data.errors) {
        sendBtn.disabled = false;
        statusMsg.classList.add('pink');
        statusMsg.textContent = data.errors;
        return;
    }

    // If OTP was sent to email, start resend OTP timer & inform user by adjusting CSS & HTML:
    aadhaarIp.readOnly = true;
    aadhaarIp.classList.add('locked');
    statusMsg.classList.remove('pink');
    otpSection.classList.remove('hidden');
    sendBtn.classList.add('hidden');
    verifyBtn.classList.remove('hidden');
    resendBtn.classList.remove('hidden');
    otpIp.required = true;
    statusMsg.textContent = data.message;
    resetResendOTPTimer();
});

// Verify OTP from User
verifyBtn.addEventListener('click', async () => {
    // I/p Valid OTP then disable btn
    const code = otpIp.value.trim();
    if (!/^\d{6}$/.test(code)) {
        statusMsg.textContent = 'OTP must be 6 digits 🙂';
        return;
    }
    verifyBtn.disabled = true;

    // Verify OTP & Login User
    statusMsg.textContent = 'Verifying...🤩';
    const verifyOTP = await fetch('verify-otp', {
        method: 'POST',
        body: JSON.stringify({ otp: code }),
        headers: { 'Content-Type': 'application/json' }
    }), data = await verifyOTP.json();

    // Display error if entered wrong OTP then enable btn
    if (data.errors) {
        verifyBtn.disabled = false;
        statusMsg.classList.add('pink');
        statusMsg.textContent = data.errors;
        return;
    }

    // Confirm session & redirect user to dashboard
    resendBtn.classList.add('hidden');
    statusMsg.textContent = data.message;
    location.assign(`/${data.role}/dashboard`);
});

function resetResendOTPTimer() {
    resendBtn.disabled = true;
    let timeLeft = 35;
    const timer = setInterval(() => {
        resendBtn.textContent = 'Resend OTP in ' + timeLeft + 's';
        if (timeLeft-- < 0) {
            clearInterval(timer);
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
            resendBtn.style.opacity = 1;
        }
    }, 1000);
}

resendBtn.addEventListener('click', async () => {
    // Check Records & Resend OTP
    if (isNaN(coords.lat) || isNaN(coords.lon)) return;
    statusMsg.textContent = "Resending OTP...😊";
    const sendOTP = await fetch('send-otp', {
        method: 'POST',
        body: JSON.stringify({ aadhaar: aadhaarIp.value, lat: coords.lat, lon: coords.lon }),
        headers: { 'Content-Type': 'application/json' }
    }), data = await sendOTP.json();
    resetResendOTPTimer();
    
    // Display OTP verification failed or success status
    if (data.errors) {
        statusMsg.textContent = data.errors;
        return;
    }
    statusMsg.textContent = data.message;
});

form.addEventListener('submit', e => e.preventDefault());