main();

const ACTIVE_CLASS = "active";

async function main() {
  const cities = await fetchCities();
  const $cities = document.getElementById("cities");
  const $nav = document.getElementById("cities-nav");
  $cities.innerHTML = createLinks(cities);
  // store in-memory so we don't have to keep querying $cities
  const links = [...$cities.children].map((city) => city.children[0]);

  $cities.addEventListener("click", (e) => {
    let link;

    if (e.target.tagName === "A") {
      link = e.target;
    } else if (e.target.tagName === "LI") {
      link = e.target.children[0];
    }

    links.forEach((link) => link.classList.remove(ACTIVE_CLASS));
    link.classList.add(ACTIVE_CLASS);
    $nav.style.setProperty("--underline-left", link.offsetLeft + "px");
    $nav.style.setProperty("--underline-width", link.offsetWidth + "px");

    const city = e.target.dataset.city; // TODO: fetch time
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
