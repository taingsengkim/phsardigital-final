/**
 * Formatter for listing attributes to ensure abbreviations (e.g. 'r' for RAM,
 * 's' for Storage) and key strings are cleanly converted to professional,
 * human-readable labels and formatted values.
 */

const KNOWN_ATTRIBUTE_MAP: Record<string, string> = {
  r: "RAM",
  ram: "RAM",
  s: "Storage",
  rom: "Storage (ROM)",
  storage: "Storage",
  cpu: "Processor (CPU)",
  processor: "Processor",
  chipset: "Chipset",
  gpu: "Graphics (GPU)",
  graphics: "Graphics",
  os: "Operating System",
  batt: "Battery",
  battery: "Battery",
  disp: "Display / Screen",
  display: "Display / Screen",
  screen: "Screen Size",
  res: "Resolution",
  resolution: "Resolution",
  cam: "Camera",
  camera: "Camera",
  front_camera: "Front Camera",
  rear_camera: "Rear Camera",
  sim: "SIM Card",
  dim: "Dimensions",
  dimensions: "Dimensions",
  wt: "Weight",
  weight: "Weight",
  conn: "Connectivity",
  connectivity: "Connectivity",
  mat: "Material",
  material: "Material",
  col: "Color",
  color: "Color",
  sz: "Size",
  size: "Size",
  cat: "Category",
  mfg: "Manufacturer",
  brand: "Brand",
  gen: "Generation",
  yr: "Year",
  mod: "Model",
  model: "Model",
  war: "Warranty",
  warranty: "Warranty",
  condition: "Condition",
  bluetooth: "Bluetooth",
  wifi: "Wi-Fi",
  water_resistance: "Water Resistance",
};

export function formatAttributeKey(rawKey: string): string {
  if (!rawKey) return "";
  const cleaned = rawKey.trim();
  const lower = cleaned.toLowerCase().replace(/[-_\s]+/g, "");

  if (KNOWN_ATTRIBUTE_MAP[lower]) {
    return KNOWN_ATTRIBUTE_MAP[lower];
  }
  if (KNOWN_ATTRIBUTE_MAP[cleaned.toLowerCase()]) {
    return KNOWN_ATTRIBUTE_MAP[cleaned.toLowerCase()];
  }

  // Handle camelCase (e.g. batteryCapacity -> battery Capacity)
  const deCamel = cleaned.replace(/([a-z])([A-Z])/g, "$1 $2");
  // Replace underscores and dashes with spaces
  const withSpaces = deCamel.replace(/[-_]+/g, " ");

  // Convert to Title Case
  return withSpaces
    .split(/\s+/)
    .map((word) => {
      const wLower = word.toLowerCase();
      if (
        [
          "ram",
          "rom",
          "cpu",
          "gpu",
          "os",
          "sim",
          "usb",
          "led",
          "oled",
          "lcd",
          "ssd",
          "hdd",
          "gb",
          "mb",
          "tb",
          "mah",
          "hdr",
          "nfc",
          "gps",
          "5g",
          "4g",
          "lte",
        ].includes(wLower)
      ) {
        return wLower.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function formatAttributeValue(rawValue: string): string {
  if (!rawValue) return "";
  const trimmed = rawValue.trim();
  // Beautify standard memory/storage units like 512mb -> 512 MB, 16gb -> 16 GB, 5000mah -> 5,000 mAh
  return trimmed
    .replace(/^(\d+)\s*(gb|mb|tb|kb)$/i, (_match, num, unit) => `${num} ${unit.toUpperCase()}`)
    .replace(/^(\d+)\s*(mah)$/i, (_match, num) => `${Number(num).toLocaleString()} mAh`)
    .replace(/^(\d+)\s*(w|watt|watts)$/i, (_match, num) => `${num}W`)
    .replace(/^(\d+)\s*(hz)$/i, (_match, num) => `${num} Hz`)
    .replace(/^(\d+)\s*(inch|inches|")$/i, (_match, num) => `${num}"`);
}
