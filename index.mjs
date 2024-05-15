import DateTime from "./lib/DateTime.mjs";

const ACTIVE_CLASS = "active";

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
  const renderDateTime = DateTime();
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
