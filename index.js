document.addEventListener("DOMContentLoaded", () => {
  main();
});

const ACTIVE_CLASS = "active";

async function main() {
  const cities = await fetchCities();
  const $cities = document.getElementById("cities");
  const $nav = document.getElementById("cities-nav");
  $cities.innerHTML = createLinks(cities);
  // store in-memory so we don't have to keep querying $cities
  const links = [...$cities.children].map((city) => city.children[0]);
  let $activeLink = null;

  $cities.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      $activeLink = e.target;
    } else if (e.target.tagName === "LI") {
      $activeLink = e.target.children[0];
    } else return;

    links.forEach((link) => link.classList.remove(ACTIVE_CLASS));
    $activeLink.classList.add(ACTIVE_CLASS);
    $nav.style.setProperty("--underline-left", $activeLink.offsetLeft + "px");
    $nav.style.setProperty("--underline-width", $activeLink.offsetWidth + "px");

    const city = e.target.dataset.city; // TODO: fetch time
  });

  window.addEventListener("resize", () => {
    $nav.style.setProperty("--underline-left", $activeLink.offsetLeft + "px");
    $nav.style.setProperty("--underline-width", $activeLink.offsetWidth + "px");

    // temporarily disable the underline animation while resizing
    $nav.style.setProperty("--underline-transition", 0);

    createDebounce()(() => {
      $nav.style.setProperty("--underline-transition", "all 300ms ease-out");
    });
  });
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
      <a data-city="${c.section}" href="#">${c.label}</a>
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
