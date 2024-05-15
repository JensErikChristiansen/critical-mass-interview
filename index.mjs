import DateTime from "./lib/DateTime.mjs";
import Nav from "./lib/Nav.mjs";

document.addEventListener("DOMContentLoaded", () => {
  main();
});

async function main() {
  const renderDateTime = DateTime();
  await renderDateTime();
  const { renderNav, applyEventHandlers } = Nav({ onClick: renderDateTime });
  await renderNav();
  applyEventHandlers();
}
