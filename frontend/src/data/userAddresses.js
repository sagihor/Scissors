/**
 * Curated list of REAL addresses in the cities where barbershops operate.
 * Used as the two-step address picker in Settings (city -> address). Free-text
 * autocomplete is not allowed on the public OpenStreetMap geocoder, so we offer
 * a verified set of real locations instead, each with accurate coordinates.
 */
const USER_ADDRESSES = [
  // ---------------- Tel Aviv ----------------
  { label: 'Dizengoff Square, Tel Aviv',          city: 'Tel Aviv',      latitude: 32.0786, longitude: 34.7741 },
  { label: 'Rothschild Boulevard, Tel Aviv',      city: 'Tel Aviv',      latitude: 32.0644, longitude: 34.7716 },
  { label: 'Tel Aviv Port (Namal), Tel Aviv',     city: 'Tel Aviv',      latitude: 32.0972, longitude: 34.7724 },
  { label: 'Florentin, Tel Aviv',                 city: 'Tel Aviv',      latitude: 32.0556, longitude: 34.7686 },
  { label: 'Neve Tzedek, Tel Aviv',               city: 'Tel Aviv',      latitude: 32.0628, longitude: 34.7642 },
  { label: 'Sarona Market, Tel Aviv',             city: 'Tel Aviv',      latitude: 32.0731, longitude: 34.7866 },
  { label: 'Tel Aviv University, Tel Aviv',       city: 'Tel Aviv',      latitude: 32.1133, longitude: 34.8044 },
  { label: 'Carmel Market, Tel Aviv',             city: 'Tel Aviv',      latitude: 32.0686, longitude: 34.7693 },

  // ---------------- Jerusalem ----------------
  { label: 'Jaffa Street, Jerusalem',             city: 'Jerusalem',     latitude: 31.7833, longitude: 35.2167 },
  { label: 'Mahane Yehuda Market, Jerusalem',     city: 'Jerusalem',     latitude: 31.7857, longitude: 35.2125 },
  { label: 'German Colony, Jerusalem',            city: 'Jerusalem',     latitude: 31.7610, longitude: 35.2199 },
  { label: 'City Center (Zion Square), Jerusalem',city: 'Jerusalem',     latitude: 31.7807, longitude: 35.2191 },
  { label: 'Talpiot, Jerusalem',                  city: 'Jerusalem',     latitude: 31.7510, longitude: 35.2230 },
  { label: 'Hebrew University (Givat Ram), Jerusalem', city: 'Jerusalem', latitude: 31.7757, longitude: 35.1972 },

  // ---------------- Haifa ----------------
  { label: 'Hadar HaCarmel, Haifa',               city: 'Haifa',         latitude: 32.8081, longitude: 34.9978 },
  { label: 'German Colony, Haifa',                city: 'Haifa',         latitude: 32.8192, longitude: 34.9876 },
  { label: 'Carmel Center, Haifa',                city: 'Haifa',         latitude: 32.7940, longitude: 34.9866 },
  { label: 'Bat Galim, Haifa',                    city: 'Haifa',         latitude: 32.8276, longitude: 34.9667 },
  { label: 'Grand Canyon Mall area, Haifa',       city: 'Haifa',         latitude: 32.7895, longitude: 35.0205 },

  // ---------------- Beersheba ----------------
  { label: 'Old City, Beersheba',                 city: 'Beersheba',     latitude: 31.2430, longitude: 34.7915 },
  { label: 'Ben Gurion University area, Beersheba', city: 'Beersheba',   latitude: 31.2620, longitude: 34.8016 },
  { label: 'Grand Canyon Mall, Beersheba',        city: 'Beersheba',     latitude: 31.2503, longitude: 34.7720 },
  { label: 'Ramot, Beersheba',                    city: 'Beersheba',     latitude: 31.2780, longitude: 34.8200 },

  // ---------------- Netanya ----------------
  { label: 'Independence Square, Netanya',        city: 'Netanya',       latitude: 32.3215, longitude: 34.8532 },
  { label: 'Ir Yamim, Netanya',                   city: 'Netanya',       latitude: 32.2860, longitude: 34.8540 },
  { label: 'Kiryat HaSharon, Netanya',            city: 'Netanya',       latitude: 32.3050, longitude: 34.8700 },

  // ---------------- Rishon LeZion ----------------
  { label: 'City Center, Rishon LeZion',          city: 'Rishon LeZion', latitude: 31.9730, longitude: 34.7925 },
  { label: 'Rothschild Street, Rishon LeZion',    city: 'Rishon LeZion', latitude: 31.9640, longitude: 34.8044 },
  { label: 'West Rishon (Marina), Rishon LeZion', city: 'Rishon LeZion', latitude: 31.9870, longitude: 34.7400 },

  // ---------------- Petah Tikva ----------------
  { label: 'City Center, Petah Tikva',            city: 'Petah Tikva',   latitude: 32.0840, longitude: 34.8878 },
  { label: 'Em HaMoshavot, Petah Tikva',          city: 'Petah Tikva',   latitude: 32.1010, longitude: 34.8590 },
  { label: 'Kfar Ganim, Petah Tikva',             city: 'Petah Tikva',   latitude: 32.0760, longitude: 34.8770 },

  // ---------------- Eilat ----------------
  { label: 'North Beach, Eilat',                  city: 'Eilat',         latitude: 29.5577, longitude: 34.9519 },
  { label: 'City Center (HaTmarim), Eilat',       city: 'Eilat',         latitude: 29.5530, longitude: 34.9510 },
  { label: 'Marina, Eilat',                       city: 'Eilat',         latitude: 29.5460, longitude: 34.9590 },
];

// A sensible global default if the browser won't share location and the user
// has not picked one yet: Dizengoff Square, Tel Aviv (a central major city).
export const DEFAULT_ADDRESS = USER_ADDRESSES[0];

// Distinct cities, in first-seen order, for the city step of the picker.
export const ADDRESS_CITIES = [...new Set(USER_ADDRESSES.map((a) => a.city))];

export default USER_ADDRESSES;