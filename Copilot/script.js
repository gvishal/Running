function parsePace(paceStr) {
  paceStr = paceStr.trim();
  if (paceStr.includes(":")) {
    const [min, sec] = paceStr.split(":").map(Number);
    if (isNaN(min) || isNaN(sec)) return NaN;
    return min + sec / 60;
  }
  const min = Number(paceStr);
  return isNaN(min) ? NaN : min;
}

// Estimate hydration needs (ml) based on weather, duration, and intensity
function estimateHydration(distance, pace, temperature) {
  // Typical marathon sweat rate: 700-1200 ml/h, higher in heat
  // For simplicity: base 800ml/hr, +10ml/hr per °C above 18°C
  const baseRate = 800;
  const extra = Math.max(0, temperature - 18) * 10;
  const minPerKm = pace;
  const durationHr = (distance * minPerKm) / 60;
  return Math.round((baseRate + extra) * durationHr);
}

document.addEventListener('DOMContentLoaded', () => {
  const prodSelect = document.getElementById('product-select');
  prodSelect.innerHTML = getProductSelectHTML();

  prodSelect.addEventListener('change', () => {
    const selectedIdxs = Array.from(prodSelect.selectedOptions).map(opt => Number(opt.value));
    document.getElementById('product-info').innerHTML = getProductInfoHTML(selectedIdxs);
  });

  let userCoords = null;
  let weatherTemp = 18; // default to cool day

  document.getElementById('get-weather').onclick = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        userCoords = { lat, lon };
        // Weather
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const res = await fetch(url);
        const data = await res.json();
        const weather = data.current_weather;
        weatherTemp = weather.temperature;
        document.getElementById('weather').textContent =
          `Temp: ${weather.temperature}°C, Wind: ${weather.windspeed}km/h`;
      }, () => {
        document.getElementById('weather').textContent = 'Unable to get location.';
      });
    } else {
      document.getElementById('weather').textContent = 'Geolocation not available.';
    }
  };

  document.getElementById('plan-run').onclick = async () => {
    const distance = parseFloat(document.getElementById('distance').value);
    const paceRaw = document.getElementById('pace').value;
    const pace = parsePace(paceRaw);
    const caffeinePref = document.getElementById('caffeine-pref').value;
    const waterInterval = parseFloat(document.getElementById('water-interval').value);
    const peeInterval = parseFloat(document.getElementById('pee-interval').value);
    const bottleSize = parseInt(document.getElementById('bottle-size').value, 10);
    const selectedIdxs = Array.from(prodSelect.selectedOptions).map(opt => Number(opt.value));
    const checked = selectedIdxs.map(idx => PRODUCTS[idx]);

    if (!distance || !pace || checked.length === 0 || !bottleSize) {
      alert('Please enter all required fields and select at least one product.');
      return;
    }

    // --------- PACING PLAN ---------
    const easyDist = Math.round(distance * 0.2);
    const targetDist = Math.round(distance * 0.65);
    const fastDist = distance - easyDist - targetDist;
    const easyPace = (pace + 0.10).toFixed(2);
    const fastPace = (pace - 0.10).toFixed(2);

    let pacePlan = [];
    if (easyDist > 0) pacePlan.push({ from: 0, to: easyDist, pace: easyPace, note: "Easy, warm-up" });
    if (targetDist > 0) pacePlan.push({ from: easyDist, to: easyDist + targetDist, pace: pace.toFixed(2), note: "Cruise at target pace" });
    if (fastDist > 0) pacePlan.push({ from: easyDist + targetDist, to: distance, pace: fastPace, note: "Strong finish" });

    document.getElementById('pace-details').innerHTML =
      `<table style="width:100%;border-collapse:collapse;">
        <tr style="background:#f0f6fa;"><th>From (km)</th><th>To (km)</th><th>Pace (min/km)</th><th>Note</th></tr>
        ${pacePlan.map(p =>
          `<tr>
            <td>${p.from}</td>
            <td>${p.to}</td>
            <td>${p.pace}</td>
            <td>${p.note}</td>
          </tr>`
        ).join('')}
      </table>`;
    document.getElementById('pace-output').style.display = 'block';

    // --------- RUN DURATION ---------
    const totalMinutes = (distance * pace).toFixed(0);

    // --------- RECOMMENDED START TIME ---------
    let lat = userCoords?.lat || 40.7128;
    let lon = userCoords?.lon || -74.0060;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth()+1).padStart(2,'0');
    const dd = String(today.getDate()).padStart(2,'0');
    const sunUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset&start_date=${yyyy}-${mm}-${dd}&end_date=${yyyy}-${mm}-${dd}&timezone=auto`;
    let sunRes = await fetch(sunUrl);
    let sunData = await sunRes.json();
    let sunrise = sunData.daily.sunrise[0] || "06:00";
    let sunset = sunData.daily.sunset[0] || "18:30";
    sunrise = sunrise.substring(11,16);
    sunset = sunset.substring(11,16);

    function addMinutes(time, mins) {
      let [h, m] = time.split(':').map(Number);
      let date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m);
      date.setMinutes(date.getMinutes() + mins);
      return date.toTimeString().substring(0,5);
    }
    const latestSafeStart = addMinutes(sunset, -totalMinutes);
    document.getElementById('start-time-details').innerHTML =
      `Today's sunrise: <b>${sunrise}</b>, sunset: <b>${sunset}</b>.<br>
      Your run will take <b>${totalMinutes} min</b>.<br>
      <b>Earliest safe start:</b> ${sunrise}<br>
      <b>Latest safe start:</b> ${latestSafeStart} (to finish before sunset)`;
    document.getElementById('start-time-output').style.display = 'block';

    // --------- HYDRATION ESTIMATION ---------
    const hydrationNeeded = estimateHydration(distance, pace, weatherTemp);
    let refillsNeeded = Math.ceil(hydrationNeeded / bottleSize) - 1;

    // --------- PRE-RUN & POST-RUN PLAN ---------
    let preCarbs = Math.round(0.8 * distance); // ~0.8g/kg/hr, for a 42km run assume 60kg: ~50g carbs
    let preNa = 400; // 400-600mg sodium
    let preWater = 400; // 400ml water

    let postCarbs = 1.2 * distance; // replenish
    let postNa = 600;
    let postWater = 600;

    document.getElementById('pre-post-details').innerHTML = `
      <ul>
        <li><b>Pre-Run (1hr before):</b> <br>
          - Drink ${preWater}ml water<br>
          - Consume ${preCarbs}g carbs (e.g. gel, banana, toast)<br>
          - ${preNa}mg sodium (electrolyte tablet or sports drink)
        </li>
        <li><b>Post-Run (within 1hr):</b> <br>
          - Drink ${postWater}ml water<br>
          - Consume ${postCarbs}g carbs<br>
          - ${postNa}mg sodium, potassium-rich foods
        </li>
      </ul>
    `;
    document.getElementById('pre-post-plan-output').style.display = 'block';

    // --------- NUTRITION + WATER/PEE BREAK PLAN ---------
    const plan = [];
    let totalCarbs = 0, totalNa = 0, totalK = 0, totalCaf = 0;
    let prodIdx = 0;

    // Intake every 5km, rotate products
    for (let km = 5; km <= distance; km += 5) {
      const prod = checked[prodIdx % checked.length];
      plan.push({
        at: km,
        prod: prod.name,
        serving: prod.serving,
        carbs: prod.carbs,
        sodium: prod.sodium,
        potassium: prod.potassium,
        caffeine: prod.caffeine,
        type: "nutrition"
      });
      totalCarbs += prod.carbs;
      totalNa += prod.sodium;
      totalK += prod.potassium;
      totalCaf += prod.caffeine;
      prodIdx++;
    }

    // Water fill breaks based on bottle size and hydration needs
    let waterUsed = 0, refillCount = 0;
    for (let km = waterInterval; km <= distance; km += waterInterval) {
      waterUsed += (hydrationNeeded / distance) * waterInterval;
      if (waterUsed > bottleSize) {
        plan.push({
          at: km,
          prod: "Water Fill",
          serving: "",
          carbs: 0,
          sodium: 0,
          potassium: 0,
          caffeine: 0,
          type: "water"
        });
        waterUsed = 0;
        refillCount++;
      }
    }

    // Pee breaks every peeInterval min
    let peeCount = Math.floor(totalMinutes / peeInterval);
    for (let i = 1; i <= peeCount; i++) {
      let atKm = Math.round((i * peeInterval) / pace);
      if (atKm < distance)
        plan.push({
          at: atKm,
          prod: "Pee Break",
          serving: "",
          carbs: 0,
          sodium: 0,
          potassium: 0,
          caffeine: 0,
          type: "pee"
        });
    }

    plan.sort((a, b) => a.at - b.at || a.type.localeCompare(b.type));

    let caffeineLimit = 100;
    if (caffeinePref === 'medium') caffeineLimit = 200;
    if (caffeinePref === 'high') caffeineLimit = 400;
    let warning = '';
    if (totalCaf > caffeineLimit) {
      warning = `Warning: Planned caffeine intake (${totalCaf}mg) exceeds your preference (${caffeineLimit}mg).`;
    }

    document.getElementById('plan-details').innerHTML = `
      <ul>
        ${plan.map(p =>
          `<li>
            At ${p.at}km: ${p.type === "nutrition"
              ? `Take <strong>${p.prod}</strong> <em>(${p.serving})</em> (Carbs: ${p.carbs}g, Na: ${p.sodium}mg, K: ${p.potassium}mg${p.caffeine ? ', Caffeine: ' + p.caffeine + 'mg' : ''})`
              : p.type === "water"
                ? `<b>Refill water bottle</b>`
                : `<b>Pee break</b>`
            }
          </li>`
        ).join('')}
      </ul>
      <hr>
      <b>Total for run:</b> Carbs: ${totalCarbs}g, Sodium: ${totalNa}mg, Potassium: ${totalK}mg, Caffeine: ${totalCaf}mg<br>
      <b>Estimated hydration needed:</b> ${hydrationNeeded}ml. <b>Refills planned:</b> ${refillCount}
    `;
    document.getElementById('caffeine-warning').textContent = warning;
    document.getElementById('plan-output').style.display = 'block';
  };
});