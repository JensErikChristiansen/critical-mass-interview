import timezones from "./timeZones.mjs";

const ACTIVE_CLASS = "active";
let interval = null;

document.addEventListener("DOMContentLoaded", () => {
  main();
});

async function main() {
  const $nav = document.getElementById("cities-nav");
  const $cities = document.getElementById("cities");
  let $activeLink = null;
  const cities = await fetchCities();
  $cities.innerHTML = createLinks(cities);
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

    $cities
      .querySelectorAll("a")
      .forEach((link) => link.classList.remove(ACTIVE_CLASS));

    $activeLink.classList.add(ACTIVE_CLASS);
    moveUnderline($activeLink);
    renderDateTime($activeLink.dataset.city, $activeLink.ariaLabel);
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

    const $oldNode = document.querySelectorAll(".date-time")[0];
    const $oldReflect = document.querySelectorAll(".date-time-reflection")[0];
    const $newReflect = $oldReflect.cloneNode(true);
    const $newNode = $oldNode.cloneNode(true);
    $newNode.querySelector(".date-time__city").textContent = label || "Home";
    $newReflect.querySelector(".date-time__city").textContent = label || "Home";

    // animate the leaving and entering of old/new datetime elements
    $oldNode.classList.add("leave-to");
    $oldReflect.classList.add("leave-to2");
    $newNode.classList.add("enter-from");
    $newReflect.classList.add("enter-from2");
    $oldNode.before($newNode);
    $oldReflect.before($newReflect);

    setTimeout(() => {
      $oldNode.remove();
      $oldReflect.remove();
    }, 1000);

    setTimeout(() => {
      $newNode.classList.remove("enter-from");
      $newReflect.classList.remove("enter-from2");
      createClock($newNode, $newReflect);

      if (interval !== null) clearInterval(interval);

      interval = setInterval(() => {
        createClock($newNode, $newReflect);
      }, 1000);
    }, 300);

    function createClock($dateTimeEl, $reflect) {
      const dateTime = new Date();

      $dateTimeEl.querySelector(".date-time__time").textContent =
        dateTime.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone,
        });

      $dateTimeEl.querySelector(".date-time__date").textContent =
        dateTime.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone,
        });

      $reflect.querySelector(".date-time__time").textContent =
        dateTime.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone,
        });

      $reflect.querySelector(".date-time__date").textContent =
        dateTime.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone,
        });
    }
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
