main();

const $cities = document.getElementById("cities");

async function main() {
  const cities = await fetchCities();
  console.log(cities);
  $cities.innerHTML = createCities(cities);
}

async function fetchCities() {
  const res = await fetch("./navigation.json");
  const json = await res.json();
  return json.cities;
}

function createCities(cities) {
  const html = cities.reduce((acc, c) => {
    return `${acc}<li class="city" data-city="${c.section}">${c.label}</li>`;
  }, "");

  console.log(html);

  return html;
}
