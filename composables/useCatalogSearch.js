const normalizeQueryValue = (value) => {
  if (Array.isArray(value)) {
    return normalizeQueryValue(value[0]);
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

export const parseQueryDate = (value) => {
  const normalized = normalizeQueryValue(value);

  if (!normalized) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [year, month, day] = normalized.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(normalized)) {
    const [day, month, year] = normalized.split(".").map(Number);
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatQueryDate = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return "";
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const normalizeDateRange = (from, to) => {
  if (
    from instanceof Date &&
    !Number.isNaN(from.getTime()) &&
    to instanceof Date &&
    !Number.isNaN(to.getTime()) &&
    from.getTime() > to.getTime()
  ) {
    return { from: to, to: from };
  }

  return { from, to };
};

export const buildQueryObject = (query = {}) => {
  return Object.fromEntries(
    Object.entries(query)
      .map(([key, value]) => [key, normalizeQueryValue(value)])
      .filter(([, value]) => value),
  );
};

export const areQueriesEqual = (left = {}, right = {}) => {
  return JSON.stringify(buildQueryObject(left)) === JSON.stringify(buildQueryObject(right));
};
