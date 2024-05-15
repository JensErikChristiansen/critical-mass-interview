import timezones from "./timeZones.mjs";

const ACTIVE_CLASS = "active";

document.addEventListener("DOMContentLoaded", () => {
  main();
});

async function main() {
  const $nav = document.getElementById("cities-nav");
  let $dateTime = document.getElementById("date-time");
  const $cities = document.getElementById("cities");
  let $activeLink = null;
  const cities = await fetchCities();
  $cities.innerHTML = createLinks(cities);
  // store in-memory so we don't have to keep querying $cities
  const $links = [...$cities.children].map((city) => city.children[0]);
  verticallyAlignUnderline($cities);
  await renderDateTime();

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
    renderDateTime(city, $activeLink.ariaLabel);
  });

  window.addEventListener(
    "resize",
    ((resizeDebounce, underlineTransition) => {
      return () => {
        if (!$activeLink) return;

        moveUnderline($activeLink);
        $nav.style.setProperty("--underline-transition", 0);

        resizeDebounce(() => {
          $nav.style.setProperty("--underline-transition", underlineTransition);
        });
      };
    })(
      createDebounce(),
      getComputedStyle($nav).getPropertyValue("--underline-transition")
    )
  );

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

  async function renderDateTime(city, label) {
    const timeZone =
      timezones[city] || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const dateTime = new Date();
    const $newNode = $dateTime.cloneNode(true);
    $newNode.querySelector("#city").textContent = label || "Here";

    $newNode.querySelector("#time").textContent = dateTime.toLocaleTimeString(
      undefined,
      {
        hour: "2-digit",
        minute: "2-digit",
        timeZone,
      }
    );

    $newNode.querySelector("#date").textContent = dateTime.toLocaleDateString(
      undefined,
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone,
      }
    );

    $dateTime.classList.add("leave-to");
    await wait();
    $newNode.classList.add("enter-from");
    $dateTime.replaceWith($newNode);
    await wait();
    $newNode.classList.remove("enter-from");
    $dateTime = $newNode;
  }

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
}

// UTILS
function createDebounce() {
  let timer = null;

  return (fn, delay = 200) => {
    if (timer !== null) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn();
      timer = null;
    }, delay);
  };
}

function wait(ms = 100) {
  return new Promise((res) => setTimeout(res, ms));
}
