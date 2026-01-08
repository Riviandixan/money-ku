// Format currency to IDR
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format number with thousand separators
export const formatNumber = (number) => {
  return new Intl.NumberFormat("id-ID").format(number);
};

// Format date to Indonesian format
export const formatDate = (date, format = "full") => {
  const d = new Date(date);

  const options = {
    full: { day: "numeric", month: "long", year: "numeric" },
    short: { day: "numeric", month: "short", year: "numeric" },
    monthYear: { month: "long", year: "numeric" },
    dayMonth: { day: "numeric", month: "long" },
    time: { hour: "2-digit", minute: "2-digit" },
  };

  return new Intl.DateTimeFormat(
    "id-ID",
    options[format] || options.full
  ).format(d);
};

// Format date for input field (YYYY-MM-DD)
export const formatDateForInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Get relative time (e.g., "2 hari yang lalu")
export const getRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "Baru saja";
  if (minutes < 60) return `${minutes} menit yang lalu`;
  if (hours < 24) return `${hours} jam yang lalu`;
  if (days < 30) return `${days} hari yang lalu`;
  if (months < 12) return `${months} bulan yang lalu`;
  return `${years} tahun yang lalu`;
};
