main();

const ACTIVE_CLASS = "active";

async function main() {
  const cities = await fetchCities();
  console.log(cities);

  const $cities = document.getElementById("cities");
  const $nav = document.getElementById("cities-nav");
  $cities.innerHTML = createCities(cities);
  // store in-memory so we don't have to keep querying $cities
  const links = [...$cities.children].map((city) => city.children[0]);

  $cities.addEventListener("click", (e) => {
    if (e.target.tagName !== "A") return;

    const city = e.target.dataset.city; // TODO: fetch time

    links.forEach((link) => link.classList.remove(ACTIVE_CLASS));

    const link = e.target;
    console.log(link);
    link.classList.add(ACTIVE_CLASS);

    $nav.style.setProperty("--underline-left", link.offsetLeft + "px");
    $nav.style.setProperty("--underline-width", link.offsetWidth + "px");
  });
}

async function fetchCities() {
  const res = await fetch("./navigation.json");
  const json = await res.json();

  return json.cities;
}

function createCities(cities) {
  const html = cities.reduce((acc, c) => {
    return `${acc}
    <li class="city">
      <a data-city="${c.section}" href="#">${c.label}</a>
    </li>`;
  }, "");

  return html;
}
