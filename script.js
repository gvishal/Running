// Helper functions for weather, planning, and UI
document.addEventListener('DOMContentLoaded', () => {
  // Load product checkboxes
  document.getElementById('product-list').innerHTML = getProductListHTML();

  // Weather fetch
  document.getElementById('get-weather').onclick = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        // Use open-meteo free API for demo
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const res = await fetch(url);
        const data = await res.json();
        const weather = data.current_weather;
        document.getElementById('weather').textContent = `Temp: ${weather.temperature}°C, Wind: ${weather.windspeed}km/h`;
      });
    } else {
      document.getElementById('weather').textContent = 'Geolocation not available.';
    }
  };

  // Plan run
  document.getElementById('plan-run').onclick = () => {
    // Inputs
    const distance = parseFloat(document.getElementById('distance').value);
    const pace = parseFloat(document.getElementById('pace').value);
    const caffeinePref = document.getElementById('caffeine-pref').value;
    const checked = Array.from(document.querySelectorAll('#product-list input:checked'))
      .map(cb => PRODUCTS[cb.value]);

    if (!distance || !pace || checked.length === 0) {
      alert('Please enter your run distance, pace, and select at least one product.');
      return;
    }

    // Planning logic
    const plan = [];
    let totalCarbs = 0, totalNa = 0, totalK = 0, totalCaf = 0;
    let nextIntake = 5; // km marker for next intake
    let prodIdx = 0;

    // Intake schedule: every 5km, rotate through products
    for (let km = nextIntake; km <= distance; km += 5) {
      const prod = checked[prodIdx % checked.length];
      plan.push({
        at: km,
        prod: prod.name,
        carbs: prod.carbs,
        sodium: prod.sodium,
        potassium: prod.potassium,
        caffeine: prod.caffeine
      });
      totalCarbs += prod.carbs;
      totalNa += prod.sodium;
      totalK += prod.potassium;
      totalCaf += prod.caffeine;
      prodIdx++;
    }

    // Caffeine warning logic (max ~200mg recommended, can adjust for pref)
    let caffeineLimit = 100;
    if (caffeinePref === 'medium') caffeineLimit = 200;
    if (caffeinePref === 'high') caffeineLimit = 400;

    let warning = '';
    if (totalCaf > caffeineLimit) {
      warning = `Warning: Planned caffeine intake (${totalCaf}mg) exceeds your preference (${caffeineLimit}mg).`;
    }

    // Output
    document.getElementById('plan-details').innerHTML = `
      <ul>
        ${plan.map(p => `<li>At ${p.at}km: Take <strong>${p.prod}</strong> (Carbs: ${p.carbs}g, Na: ${p.sodium}mg, K: ${p.potassium}mg${p.caffeine ? ', Caffeine: ' + p.caffeine + 'mg' : ''})</li>`).join('')}
      </ul>
      <hr>
      <b>Total for run:</b> Carbs: ${totalCarbs}g, Sodium: ${totalNa}mg, Potassium: ${totalK}mg, Caffeine: ${totalCaf}mg
    `;
    document.getElementById('caffeine-warning').textContent = warning;
    document.getElementById('plan-output').style.display = 'block';
  };
});