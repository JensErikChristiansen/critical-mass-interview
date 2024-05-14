import timezones, { TIMEZONE_BASE_URL } from "./timezones.mjs";

const ACTIVE_CLASS = "active";

document.addEventListener("DOMContentLoaded", () => {
  main();
});

async function main() {
  const cities = await fetchCities();
  const $nav = document.getElementById("cities-nav");
  let $dateTime = document.getElementById("date-time");
  const $cities = document.getElementById("cities");
  $cities.innerHTML = createLinks(cities);
  // store in-memory so we don't have to keep querying $cities
  const $links = [...$cities.children].map((city) => city.children[0]);
  verticallyAlignUnderline($cities);
  let $activeLink = null;

  $cities.addEventListener("click", async (e) => {
    let $currentLink = e.target;

    if (e.target.tagName === "A") {
      $currentLink = e.target;
    } else if (e.target.tagName === "LI") {
      $currentLink = e.target.children[0];
    } else return;

    if ($activeLink === $currentLink) return;

    $activeLink = $currentLink;
    $links.forEach((link) => link.classList.remove(ACTIVE_CLASS));
    $activeLink.classList.add(ACTIVE_CLASS);
    moveUnderline($activeLink);
    const city = $activeLink.dataset.city;
    await updateDateTime(city, $activeLink.ariaLabel);
  });

  function moveUnderline(link) {
    $nav.style.setProperty("--underline-left", link.offsetLeft + "px");
    $nav.style.setProperty("--underline-width", link.offsetWidth + "px");
    verticallyAlignUnderline(link.parentElement);
  }

  function verticallyAlignUnderline(el) {
    $nav.style.setProperty(
      "--underline-top",
      el.offsetTop + el.offsetHeight + "px"
    );
  }

  window.addEventListener("resize", () => {
    if (!$activeLink) return;

    moveUnderline($activeLink);

    const underlineTransition = $nav.style.getPropertyValue(
      "--underline-transition"
    );

    $nav.style.setProperty("--underline-transition", 0);

    createDebounce()(() => {
      $nav.style.setProperty("--underline-transition", underlineTransition);
    });
  });

  updateDateTime();

  async function updateDateTime(city, label) {
    const timezone =
      timezones[city] || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const res = await fetch(TIMEZONE_BASE_URL + timezone);
    const json = await res.json();
    // remove the offset so we get THEIR local time
    const dateTimeString = json.datetime.replace(/\+.*$/, "");
    const dateTime = new Date(dateTimeString);
    const $newNode = $dateTime.cloneNode(true);
    $newNode.querySelector("#city").textContent = label || "Here";

    $newNode.querySelector("#time").textContent = dateTime.toLocaleTimeString(
      undefined,
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    $newNode.querySelector("#date").textContent = new Date(
      dateTimeString
    ).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    $dateTime.classList.add("leave-to");
    await wait();
    $newNode.classList.add("enter-from");
    $dateTime.replaceWith($newNode);
    await wait();
    $newNode.classList.remove("enter-from");
    $dateTime = $newNode;
  }
}

async function fetchCities() {
  const res = await fetch("./navigation.json");
  const json = await res.json();

  return json.cities;
}

function createLinks(cities) {
  const html = cities.reduce((acc, c) => {
    return `${acc}
    <li class="city">
      <a data-city="${c.section}" href="#" aria-label="${c.label}">${c.label}</a>
    </li>`;
  }, "");

  return html;
}

function createDebounce() {
  let timer;

  return (fn, delay = 200) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, delay);
  };
}

function wait(ms = 100) {
  return new Promise((res) => setTimeout(res, ms));
}
