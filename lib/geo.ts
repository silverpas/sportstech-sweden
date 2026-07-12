// Longitude / latitude for common Swedish HQ cities, plus a simplified Sweden
// border traced as [lon, lat] points. Dots and outline share one projection so
// they always line up, even though the outline is stylized.

export const CITY_COORDS: Record<string, [number, number]> = {
  stockholm: [18.07, 59.33],
  solna: [18.0, 59.36],
  kista: [17.94, 59.4],
  sundbyberg: [17.97, 59.36],
  lidingö: [18.13, 59.36],
  nacka: [18.16, 59.31],
  danderyd: [18.03, 59.4],
  sollentuna: [17.95, 59.43],
  täby: [18.06, 59.44],
  sigtuna: [17.72, 59.62],
  södertälje: [17.63, 59.2],
  göteborg: [11.97, 57.71],
  gothenburg: [11.97, 57.71],
  mölndal: [12.01, 57.66],
  malmö: [13.0, 55.6],
  lund: [13.19, 55.7],
  helsingborg: [12.69, 56.05],
  uppsala: [17.64, 59.86],
  västerås: [16.55, 59.61],
  linköping: [15.62, 58.41],
  örebro: [15.21, 59.27],
  norrköping: [16.19, 58.59],
  jönköping: [14.16, 57.78],
  karlstad: [13.51, 59.38],
  växjö: [14.81, 56.88],
  halmstad: [12.86, 56.67],
  sundsvall: [17.31, 62.39],
  gävle: [17.14, 60.67],
  borås: [12.94, 57.72],
  eskilstuna: [16.51, 59.37],
  falun: [15.63, 60.61],
  östersund: [14.64, 63.18],
  kalmar: [16.36, 56.66],
  umeå: [20.26, 63.83],
  luleå: [22.16, 65.58],
  skellefteå: [20.95, 64.75],
  trollhättan: [12.29, 58.28],
  karlskrona: [15.59, 56.16],
  visby: [18.29, 57.63],
  piteå: [21.48, 65.32],
  örnsköldsvik: [18.72, 63.29],
  kristianstad: [14.16, 56.03],
  varberg: [12.25, 57.11],
  motala: [15.04, 58.54],
  nyköping: [17.01, 58.75],
  ängelholm: [12.86, 56.24],
};

// Rough Sweden border, traced clockwise from the south.
export const SWEDEN_BORDER: [number, number][] = [
  [13.0, 55.4],
  [12.9, 56.2],
  [11.9, 57.7],
  [11.2, 58.3],
  [11.5, 59.0],
  [11.9, 59.9],
  [12.3, 61.0],
  [12.6, 61.6],
  [12.1, 63.0],
  [14.0, 64.5],
  [15.5, 66.3],
  [17.0, 68.0],
  [20.0, 69.05],
  [23.2, 68.0],
  [24.1, 65.8],
  [21.5, 65.4],
  [21.0, 64.0],
  [17.8, 62.9],
  [17.4, 60.7],
  [18.9, 59.6],
  [16.8, 58.4],
  [16.5, 57.0],
  [14.7, 56.2],
  [13.0, 55.4],
];

// Projection bounds (a little padding around the country).
const LON_MIN = 10.8;
const LON_MAX = 24.3;
const LAT_MIN = 55.0;
const LAT_MAX = 69.3;

export const MAP_W = 260;
export const MAP_H = 560;

export function project([lon, lat]: [number, number]): [number, number] {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * MAP_W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * MAP_H;
  return [x, y];
}

export function borderPath(): string {
  return (
    SWEDEN_BORDER.map((p, i) => {
      const [x, y] = project(p);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ") + " Z"
  );
}

/** Look up a city's projected point, tolerating case/spacing differences. */
export function cityPoint(city: string): [number, number] | null {
  const key = city.trim().toLowerCase();
  const coord = CITY_COORDS[key];
  if (!coord) return null;
  return project(coord);
}
