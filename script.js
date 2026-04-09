document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     DOM ELEMENTS
  ========================= */
  const clock = document.querySelector('.clock');
  const hourHand = document.querySelector('[data-hour-hand]');
  const minuteHand = document.querySelector('[data-minute-hand]');
  const secondHand = document.querySelector('[data-second-hand]');
  const digitalClock = document.getElementById("digital-clock");
  const ampmDisplay = document.getElementById("ampm-display");
  const toggleBtn = document.getElementById("toggle-theme");
  const timezoneSelect = document.getElementById("timezone-select");
  const timezoneDisplay = document.getElementById("timezone-display");

  /* =========================
     STATE
  ========================= */
  let selectedTimeZone = "local";
  let lastDigits = [];

  /* =========================
     INIT NUMBERS (ANALOG)
  ========================= */
  function createClockNumbers() {
    if (!clock) return;

    for (let i = 1; i <= 12; i++) {
      const number = document.createElement("div");
      number.classList.add("number");

      number.style.setProperty('--rotation', i * 30);
      number.innerHTML = `<span style="transform: rotate(${i * -30}deg)">${i}</span>`;

      clock.appendChild(number);
    }
  }

  /* =========================
     EVENTS
  ========================= */
  function setupEvents() {
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
      });
    }

    if (timezoneSelect) {
      timezoneSelect.addEventListener("change", (e) => {
        selectedTimeZone = e.target.value;

        // IMPORTANT: reset digits to prevent stacking bug
        lastDigits = [];
        digitalClock.innerHTML = "";
      });
    }
  }

  /* =========================
     MAIN LOOP
  ========================= */
  let lastSecond = null;

function updateClock() {
  const now = getCurrentDate();

  const currentSecond = now.getSeconds();

  // Only update digital clock when second changes
  if (currentSecond !== lastSecond) {
    updateDigitalClock(now);
    lastSecond = currentSecond;
  }

  updateAnalogClock(now);
  updateTimezoneDisplay();

  requestAnimationFrame(updateClock);
}

  /* =========================
     ANALOG CLOCK
  ========================= */
  function updateAnalogClock(date) {
    if (!hourHand || !minuteHand || !secondHand) return;

    const seconds = date.getSeconds() + date.getMilliseconds() / 1000;
    const minutes = date.getMinutes();
    const hours = date.getHours();

    const secondsRatio = seconds / 60;
    const minutesRatio = (secondsRatio + minutes) / 60;
    const hoursRatio = (minutesRatio + (hours % 12)) / 12;

    setRotation(secondHand, secondsRatio);
    setRotation(minuteHand, minutesRatio);
    setRotation(hourHand, hoursRatio);
  }

  /* =========================
     DIGITAL CLOCK
  ========================= */
  function updateDigitalClock(date) {

    const currentDigitLength = digitalClock.querySelectorAll(".digit").length;

    if (!digitalClock) return;

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const ampm = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;

    const format = (n) => String(n).padStart(2, "0");

    const timeString = `${hours12}:${format(minutes)}:${format(seconds)}`;

    const newDigits = timeString.split("");

    /* =========================
       FIRST RENDER (BUILD ONCE)
    ========================= */
    if (currentDigitLength !== newDigits.length) {
  digitalClock.innerHTML = `
    ${timeString
      .split("")
      .map(d => `<span class="digit">${d}</span>`)
      .join("")}
    <span class="ampm">${ampm}</span>
  `;

  lastDigits = newDigits;
  return;
}

    const digitSpans = digitalClock.querySelectorAll(".digit");

    /* =========================
       UPDATE DIGITS (NO STACKING)
    ========================= */
    newDigits.forEach((digit, i) => {
  const span = digitSpans[i];

  if (!span) return;

  if (digit !== lastDigits[i]) {
    span.classList.remove("flip-in");
    span.classList.add("flip-out");

    span.addEventListener("animationend", function handler() {
      span.removeEventListener("animationend", handler);

      span.textContent = digit;

      span.classList.remove("flip-out");
      span.classList.add("flip-in");
    });
  }
});

    lastDigits = newDigits;

    /* =========================
       AM/PM (SEPARATE ELEMENT)
    ========================= */
    if (ampmDisplay) {
      ampmDisplay.textContent = ampm;
    }
  }

  /* =========================
     TIMEZONE HANDLING
  ========================= */
  function getCurrentDate() {
    if (selectedTimeZone === "local") {
      return new Date();
    }

    const now = new Date();

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: selectedTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });

    const parts = formatter.formatToParts(now);

    const values = {};
    parts.forEach(({ type, value }) => {
      if (type !== "literal") values[type] = value;
    });

    const date = new Date();
    date.setHours(
      Number(values.hour),
      Number(values.minute),
      Number(values.second),
      now.getMilliseconds()
    );

    return date;
  }

  function updateTimezoneDisplay() {
    if (!timezoneDisplay) return;

    if (selectedTimeZone === "local") {
      timezoneDisplay.textContent = "Local Time";
      return;
    }

    timezoneDisplay.textContent = selectedTimeZone.replaceAll("_", " ");
  }

  /* =========================
     HELPERS
  ========================= */
  function setRotation(element, ratio) {
    element.style.setProperty('--rotation', ratio * 360);
  }

  /* =========================
     INIT
  ========================= */
  function init() {
    createClockNumbers();
    setupEvents();
    updateClock();
  }

  init();
});