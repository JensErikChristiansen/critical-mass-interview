export default function Nav({ onClick }) {
  const $nav = document.getElementById("cities-nav");
  const $cities = document.getElementById("cities");
  let $activeLink = null;
  const ACTIVE_CLASS = "active";

  const underlineTransition = getComputedStyle($nav).getPropertyValue(
    "--underline-transition"
  );

  return {
    renderNav,
    applyEventHandlers,
  };

  async function renderNav() {
    const cities = await fetchCities();

    $cities.innerHTML = cities.reduce((acc, c) => {
      return `${acc}
        <li class="city">
          <a data-city="${c.section}" href="#" aria-label="${c.label}">
            ${c.label}
          </a>
        </li>`;
    }, "");

    verticallyAlignUnderline($cities);
  }

  async function fetchCities() {
    const res = await fetch("./navigation.json");
    const json = await res.json();

    return json.cities;
  }

  function verticallyAlignUnderline(el) {
    $nav.style.setProperty(
      "--underline-top",
      el.offsetTop + el.offsetHeight + "px"
    );
  }

  function applyEventHandlers() {
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
      moveUnderline();
      onClick($activeLink.dataset.city, $activeLink.ariaLabel);
    });

    const resizeDebounce = createDebounce();

    window.addEventListener("resize", () => {
      if (!$activeLink) return;

      moveUnderline();
      $nav.style.setProperty("--underline-transition", 0);

      resizeDebounce(() => {
        $nav.style.setProperty("--underline-transition", underlineTransition);
      });
    });
  }

  function moveUnderline() {
    $nav.style.setProperty("--underline-left", $activeLink.offsetLeft + "px");
    $nav.style.setProperty("--underline-width", $activeLink.offsetWidth + "px");
    verticallyAlignUnderline($activeLink.parentElement);
  }
}

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
