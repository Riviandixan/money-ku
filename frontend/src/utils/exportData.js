import { formatCurrency, formatDate } from "./formatters";

// Export transactions to CSV
export const exportToCSV = (
  transactions,
  wallets,
  filename = "transactions.csv"
) => {
  // Create CSV header
  const headers = ["Tanggal", "Tipe", "Dompet", "Jumlah", "Catatan"];

  // Create CSV rows
  const rows = transactions.map((transaction) => {
    const wallet = wallets.find(
      (w) => w.id === transaction.walletId || w.id === transaction.fromWalletId
    );

    let type = "";
    if (transaction.type === "income") type = "Pemasukan";
    else if (transaction.type === "expense") type = "Pengeluaran";
    else if (transaction.type === "transfer") type = "Transfer";

    return [
      formatDate(transaction.date, "short"),
      type,
      wallet?.name || "-",
      transaction.amount,
      transaction.description || "-",
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export wallet summary to CSV
export const exportWalletSummaryToCSV = (
  wallets,
  filename = "wallet-summary.csv"
) => {
  const headers = ["Nama Dompet", "Tipe", "Saldo", "Budget"];

  const rows = wallets.map((wallet) => [
    wallet.name,
    wallet.type,
    wallet.balance,
    wallet.budget || "-",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
