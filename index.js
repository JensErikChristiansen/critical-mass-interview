main();

const ACTIVE_CLASS = "active";

async function main() {
  const cities = await fetchCities();
  console.log(cities);

  const $cities = document.getElementById("cities");
  $cities.innerHTML = createCities(cities);
  // store in-memory so we don't have to keep querying $cities
  const links = [...$cities.children].map((city) => city.children[0]);

  $cities.addEventListener("click", (e, a, b) => {
    const city = e.target.dataset.city; // TODO: fetch time

    links.forEach((link) => link.classList.remove(ACTIVE_CLASS));

    e.target.classList.add(ACTIVE_CLASS);
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
