/* ============================================================
   ROOMLINE — shared script for all pages
   ============================================================ */

// ---- change this if your API runs elsewhere ----
const API_BASE = "";

// ---- highlight current stop in the top nav ----
(function markActiveRoute(){
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".route a").forEach(a=>{
    if(a.getAttribute("href") === page) a.classList.add("active");
  });
})();

// ---- the 218 neighbourhoods the model was trained on ----
const NEIGHBOURHOODS = ["Allerton", "Arden Heights", "Arrochar", "Arverne", "Astoria", "Bath Beach", "Battery Park City", "Bay Ridge", "Bay Terrace", "Bay Terrace, Staten Island", "Baychester", "Bayside", "Bayswater", "Bedford-Stuyvesant", "Belle Harbor", "Bellerose", "Belmont", "Bensonhurst", "Bergen Beach", "Boerum Hill", "Borough Park", "Breezy Point", "Briarwood", "Brighton Beach", "Bronxdale", "Brooklyn Heights", "Brownsville", "Bull's Head", "Bushwick", "Cambria Heights", "Canarsie", "Carroll Gardens", "Castle Hill", "Castleton Corners", "Chelsea", "Chinatown", "City Island", "Civic Center", "Claremont Village", "Clason Point", "Clifton", "Clinton Hill", "Co-op City", "Cobble Hill", "College Point", "Columbia St", "Concord", "Concourse", "Concourse Village", "Coney Island", "Corona", "Crown Heights", "Cypress Hills", "DUMBO", "Ditmars Steinway", "Dongan Hills", "Douglaston", "Downtown Brooklyn", "Dyker Heights", "East Elmhurst", "East Flatbush", "East Harlem", "East Morrisania", "East New York", "East Village", "Eastchester", "Edenwald", "Edgemere", "Elmhurst", "Eltingville", "Emerson Hill", "Far Rockaway", "Fieldston", "Financial District", "Flatbush", "Flatiron District", "Flatlands", "Flushing", "Fordham", "Forest Hills", "Fort Greene", "Fort Hamilton", "Fresh Meadows", "Glendale", "Gowanus", "Gramercy", "Graniteville", "Grant City", "Gravesend", "Great Kills", "Greenpoint", "Greenwich Village", "Grymes Hill", "Harlem", "Hell's Kitchen", "Highbridge", "Hollis", "Holliswood", "Howard Beach", "Howland Hook", "Huguenot", "Hunts Point", "Inwood", "Jackson Heights", "Jamaica", "Jamaica Estates", "Jamaica Hills", "Kensington", "Kew Gardens", "Kew Gardens Hills", "Kingsbridge", "Kips Bay", "Laurelton", "Lighthouse Hill", "Little Italy", "Little Neck", "Long Island City", "Longwood", "Lower East Side", "Manhattan Beach", "Marble Hill", "Mariners Harbor", "Maspeth", "Melrose", "Middle Village", "Midland Beach", "Midtown", "Midwood", "Mill Basin", "Morningside Heights", "Morris Heights", "Morris Park", "Morrisania", "Mott Haven", "Mount Eden", "Mount Hope", "Murray Hill", "Navy Yard", "Neponsit", "New Brighton", "New Dorp", "New Dorp Beach", "New Springville", "NoHo", "Nolita", "North Riverdale", "Norwood", "Oakwood", "Olinville", "Ozone Park", "Park Slope", "Parkchester", "Pelham Bay", "Pelham Gardens", "Port Morris", "Port Richmond", "Prince's Bay", "Prospect Heights", "Prospect-Lefferts Gardens", "Queens Village", "Randall Manor", "Red Hook", "Rego Park", "Richmond Hill", "Ridgewood", "Riverdale", "Rockaway Beach", "Roosevelt Island", "Rosebank", "Rosedale", "Rossville", "Schuylerville", "Sea Gate", "Sheepshead Bay", "Shore Acres", "Silver Lake", "SoHo", "Soundview", "South Beach", "South Ozone Park", "South Slope", "Springfield Gardens", "Spuyten Duyvil", "St. Albans", "St. George", "Stapleton", "Stuyvesant Town", "Sunnyside", "Sunset Park", "Theater District", "Throgs Neck", "Todt Hill", "Tompkinsville", "Tottenville", "Tremont", "Tribeca", "Two Bridges", "Unionport", "University Heights", "Upper East Side", "Upper West Side", "Van Nest", "Vinegar Hill", "Wakefield", "Washington Heights", "West Brighton", "West Farms", "West Village", "Westchester Square", "Westerleigh", "Whitestone", "Williamsbridge", "Williamsburg", "Willowbrook", "Windsor Terrace", "Woodhaven", "Woodlawn", "Woodside"];

const BOROUGHS = ["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"];

// Room-type class metadata — kept in one place so colors/labels stay consistent
const CLASSES = {
  "Entire home/apt": { key:"entire",  color:"var(--green)",     line:"4 · 5 · 6",  desc:"The express. The whole place, to yourself." },
  "Private room":    { key:"private", color:"var(--orange)",    line:"B · D · F · M", desc:"The local. Your own room, a shared building." },
  "Shared room":     { key:"shared",  color:"var(--grey-line)", line:"L",          desc:"The shuttle. Space — and everything in it — is shared." }
};

// ---- populate <select>/<datalist> elements on the predict page ----
function populateOptions(){
  const boroughSel = document.getElementById("neighbourhood_group");
  const neighList  = document.getElementById("neighbourhood-list");
  if(boroughSel){
    BOROUGHS.forEach(b=>{
      const o = document.createElement("option");
      o.value = b; o.textContent = b;
      boroughSel.appendChild(o);
    });
  }
  if(neighList){
    NEIGHBOURHOODS.forEach(n=>{
      const o = document.createElement("option");
      o.value = n;
      neighList.appendChild(o);
    });
  }
}

// ---- mini locator: plots lat/long on a stylized 5-borough grid ----
// NYC listings roughly fall within this box; purely illustrative, not a real map.
const LAT_RANGE = [40.49, 40.92];
const LON_RANGE = [-74.26, -73.68];

function updateLocator(lat, lon){
  const dot = document.getElementById("locator-dot");
  if(!dot) return;
  const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
  const yPct = clamp((LAT_RANGE[1]-lat)/(LAT_RANGE[1]-LAT_RANGE[0]), 0, 1);
  const xPct = clamp((lon-LON_RANGE[0])/(LON_RANGE[1]-LON_RANGE[0]), 0, 1);
  dot.setAttribute("cx", (20 + xPct*260).toFixed(1));
  dot.setAttribute("cy", (16 + yPct*200).toFixed(1));
  dot.style.opacity = (isFinite(lat)&&isFinite(lon)) ? "1" : "0";
}

// ---- wire up the predict form ----
function initPredictForm(){
  const form = document.getElementById("predict-form");
  if(!form) return;

  populateOptions();

  const latInput = document.getElementById("latitude");
  const lonInput = document.getElementById("longitude");
  const syncLocator = ()=> updateLocator(parseFloat(latInput.value), parseFloat(lonInput.value));
  latInput.addEventListener("input", syncLocator);
  lonInput.addEventListener("input", syncLocator);

  const resultBox = document.getElementById("result");
  const errorBox  = document.getElementById("error-box");
  const loader    = document.getElementById("loader");
  const submitBtn = document.getElementById("submit-btn");

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    errorBox.classList.remove("show");
    resultBox.classList.remove("show");

    const payload = {
      latitude: parseFloat(latInput.value),
      longitude: parseFloat(lonInput.value),
      price: parseFloat(document.getElementById("price").value),
      minimum_nights: parseInt(document.getElementById("minimum_nights").value, 10),
      number_of_reviews: parseInt(document.getElementById("number_of_reviews").value, 10),
      reviews_per_month: parseFloat(document.getElementById("reviews_per_month").value || 0),
      calculated_host_listings_count: parseInt(document.getElementById("calculated_host_listings_count").value, 10),
      availability_365: parseInt(document.getElementById("availability_365").value, 10),
      neighbourhood_group: document.getElementById("neighbourhood_group").value,
      neighbourhood: document.getElementById("neighbourhood").value
    };

    submitBtn.disabled = true;
    loader.classList.add("show");

    try{
      const res = await fetch(`/predict`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(payload)
      });

      if(!res.ok){
        const detail = await res.text();
        throw new Error(`API returned ${res.status}: ${detail.slice(0,200)}`);
      }

      const data = await res.json();
      renderResult(data);
    }catch(err){
      errorBox.textContent = "Couldn't reach the predictor — " + err.message;
      errorBox.classList.add("show");
    }finally{
      submitBtn.disabled = false;
      loader.classList.remove("show");
    }
  });
}

function renderResult(data){
  const predicted = data.Predicted_room_type;
  const probs = data.Probability || [];
  // Model classes come back alphabetically from scikit-learn:
  const order = ["Entire home/apt", "Private room", "Shared room"];

  const meta = CLASSES[predicted] || { color:"var(--yellow)", key:"" };
  document.getElementById("result-label").textContent = predicted;
  document.getElementById("result-label").style.color = meta.color;

  const maxProb = Math.max(...probs);
  document.getElementById("result-conf").textContent =
    `${(maxProb*100).toFixed(1)}% confidence`;

  order.forEach((label, i)=>{
    const pct = ((probs[i] || 0) * 100);
    const fill = document.getElementById(`bar-${CLASSES[label].key}`);
    const pctLabel = document.getElementById(`pct-${CLASSES[label].key}`);
    if(fill){ fill.style.width = pct.toFixed(1) + "%"; }
    if(pctLabel){ pctLabel.textContent = pct.toFixed(1) + "%"; }
  });

  document.getElementById("result").classList.add("show");
  document.getElementById("result").scrollIntoView({ behavior:"smooth", block:"nearest" });
}

document.addEventListener("DOMContentLoaded", initPredictForm);
