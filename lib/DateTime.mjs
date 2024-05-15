import timezones from "../timeZones.mjs";

export default function DateTime() {
  let interval = null;
  let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function renderDateTime(city, label) {
    timeZone =
      timezones[city] || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const $oldNode = document.querySelectorAll(".date-time")[0];
    const $newNode = $oldNode.cloneNode(true);
    $newNode.querySelector(".date-time__city").textContent = label || "Home";

    // animate the leaving and entering of old/new datetime elements
    $oldNode.classList.add("leave-to");
    $newNode.classList.add("enter-from");
    $oldNode.before($newNode);
    const $time = $newNode.querySelector(".date-time__time");
    const $date = $newNode.querySelector(".date-time__date");

    setTimeout(() => {
      $oldNode.remove();
    }, 1000);

    setTimeout(() => {
      $newNode.classList.remove("enter-from");
      printClock($time, $date);

      if (interval !== null) clearInterval(interval);

      interval = setInterval(() => {
        printClock($time, $date);
      }, 1000);
    }, 300);
  }

  function printClock($time, $date) {
    const dateTime = new Date();

    $time.textContent = dateTime.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone,
    });

    $date.textContent = dateTime.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone,
    });
  }

  return renderDateTime;
}
