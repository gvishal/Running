// Nutrition facts for GU, Maurten, SIS
// (Sourced from https://www.cranksports.com/egel/comparisons/ and official product sites)
const PRODUCTS = [
  // GU gels
  {
    brand: "GU",
    name: "GU Energy Gel (Regular)",
    carbs: 22,
    sodium: 55,
    potassium: 40,
    caffeine: 0
  },
  {
    brand: "GU",
    name: "GU Energy Gel (Caffeine)",
    carbs: 22,
    sodium: 60,
    potassium: 40,
    caffeine: 20
  },
  {
    brand: "GU",
    name: "GU Roctane Gel",
    carbs: 21,
    sodium: 125,
    potassium: 55,
    caffeine: 35
  },
  {
    brand: "GU",
    name: "GU Chews",
    carbs: 23,
    sodium: 40,
    potassium: 40,
    caffeine: 0
  },
  // Maurten
  {
    brand: "Maurten",
    name: "Maurten Gel 100",
    carbs: 25,
    sodium: 35,
    potassium: 0,
    caffeine: 0
  },
  {
    brand: "Maurten",
    name: "Maurten Gel 100 CAF 100",
    carbs: 25,
    sodium: 35,
    potassium: 0,
    caffeine: 100
  },
  {
    brand: "Maurten",
    name: "Maurten Drink Mix 160",
    carbs: 39,
    sodium: 200,
    potassium: 0,
    caffeine: 0
  },
  {
    brand: "Maurten",
    name: "Maurten Drink Mix 320",
    carbs: 79,
    sodium: 500,
    potassium: 0,
    caffeine: 0
  },
  // SIS
  {
    brand: "SIS",
    name: "SIS GO Isotonic Energy Gel",
    carbs: 22,
    sodium: 36,
    potassium: 9,
    caffeine: 0
  },
  {
    brand: "SIS",
    name: "SIS GO Energy + Caffeine Gel",
    carbs: 22,
    sodium: 36,
    potassium: 9,
    caffeine: 75
  },
  {
    brand: "SIS",
    name: "SIS Electrolyte Powder",
    carbs: 19,
    sodium: 245,
    potassium: 70,
    caffeine: 0
  },
  {
    brand: "SIS",
    name: "SIS Beta Fuel",
    carbs: 80,
    sodium: 200,
    potassium: 100,
    caffeine: 0
  }
];

function getProductListHTML() {
  return PRODUCTS.map((prod, idx) => `
    <label class="product-checkbox">
      <input type="checkbox" value="${idx}" />
      <strong>${prod.brand}</strong>: ${prod.name} 
      <small>(Carbs: ${prod.carbs}g, Na: ${prod.sodium}mg, K: ${prod potassium}mg, ${prod.caffeine ? 'Caffeine: ' + prod.caffeine + 'mg' : 'No caffeine'})</small>
    </label>
  `).join('');
}