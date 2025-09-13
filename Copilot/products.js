// Nutrition facts for GU, Maurten, SIS, SaltStick
// SaltStick nutrition info sourced from https://saltstick.com/pages/products

const PRODUCTS = [
  // GU gels
  { brand: "GU", name: "GU Energy Gel (Regular)", carbs: 22, sodium: 55, potassium: 40, caffeine: 0, serving: "1 packet" },
  { brand: "GU", name: "GU Energy Gel (Caffeine)", carbs: 22, sodium: 60, potassium: 40, caffeine: 20, serving: "1 packet" },
  { brand: "GU", name: "GU Roctane Gel", carbs: 21, sodium: 125, potassium: 55, caffeine: 35, serving: "1 packet" },
  { brand: "GU", name: "GU Chews", carbs: 23, sodium: 40, potassium: 40, caffeine: 0, serving: "4 chews" },
  { brand: "GU", name: "GU Liquid Energy Gel", carbs: 23, sodium: 70, potassium: 35, caffeine: 0, serving: "1 packet" },
  { brand: "GU", name: "GU Liquid Energy Gel (Caffeine)", carbs: 23, sodium: 70, potassium: 35, caffeine: 20, serving: "1 packet" },
  // Maurten
  { brand: "Maurten", name: "Maurten Gel 100", carbs: 25, sodium: 35, potassium: 0, caffeine: 0, serving: "1 gel" },
  { brand: "Maurten", name: "Maurten Gel 100 CAF 100", carbs: 25, sodium: 35, potassium: 0, caffeine: 100, serving: "1 gel" },
  { brand: "Maurten", name: "Maurten Drink Mix 160", carbs: 39, sodium: 200, potassium: 0, caffeine: 0, serving: "1 bottle (500ml)" },
  { brand: "Maurten", name: "Maurten Drink Mix 320", carbs: 79, sodium: 500, potassium: 0, caffeine: 0, serving: "1 bottle (500ml)" },
  // SIS
  { brand: "SIS", name: "SIS GO Isotonic Energy Gel", carbs: 22, sodium: 36, potassium: 9, caffeine: 0, serving: "1 gel" },
  { brand: "SIS", name: "SIS GO Energy + Caffeine Gel", carbs: 22, sodium: 36, potassium: 9, caffeine: 75, serving: "1 gel" },
  { brand: "SIS", name: "SIS Electrolyte Powder", carbs: 19, sodium: 245, potassium: 70, caffeine: 0, serving: "1 bottle (500ml)" },
  { brand: "SIS", name: "SIS Beta Fuel", carbs: 80, sodium: 200, potassium: 100, caffeine: 0, serving: "1 bottle (500ml)" },
  // SaltStick (values per serving/capsule)
  { brand: "SaltStick", name: "SaltStick FastChews", carbs: 1, sodium: 50, potassium: 15, caffeine: 0, serving: "2 tablets" },
  { brand: "SaltStick", name: "SaltStick FastChews (Caffeinated)", carbs: 1, sodium: 50, potassium: 15, caffeine: 30, serving: "2 tablets" },
  { brand: "SaltStick", name: "SaltStick Caps", carbs: 0, sodium: 215, potassium: 63, caffeine: 0, serving: "1 capsule" },
  { brand: "SaltStick", name: "SaltStick Caps Plus", carbs: 0, sodium: 190, potassium: 53, caffeine: 30, serving: "1 capsule" },
  { brand: "SaltStick", name: "SaltStick Elixalyte", carbs: 0, sodium: 210, potassium: 50, caffeine: 0, serving: "5ml" }
];

function getProductSelectHTML() {
  return PRODUCTS.map((prod, idx) =>
    `<option value="${idx}">${prod.brand}: ${prod.name}</option>`
  ).join('');
}

function getProductInfoHTML(selectedIdxs) {
  if (selectedIdxs.length === 0) return 'No products selected.';
  let rows = selectedIdxs.map(idx => {
    const prod = PRODUCTS[idx];
    return `<tr>
      <td>${prod.brand}</td>
      <td>${prod.name}</td>
      <td>${prod.serving}</td>
      <td>${prod.carbs}g</td>
      <td>${prod.sodium}mg</td>
      <td>${prod.potassium}mg</td>
      <td>${prod.caffeine ? prod.caffeine + "mg" : "0mg"}</td>
    </tr>`;
  }).join('');
  return `
    <table class="products-table">
      <thead>
        <tr>
          <th>Brand</th>
          <th>Product</th>
          <th>Serving</th>
          <th>Carbs</th>
          <th>Sodium</th>
          <th>Potassium</th>
          <th>Caffeine</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}