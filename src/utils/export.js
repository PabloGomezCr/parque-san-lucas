// A data URL lets React render the download link without creating DOM nodes.
export function csvDownload(rows, columns) {
  const cell = (value) => {
    let text = String(value ?? "");
    if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const csv = [
    columns.map((c) => cell(c.label)).join(","),
    ...rows.map((row) => columns.map((c) => cell(row[c.key])).join(",")),
  ].join("\r\n");
  return `data:text/csv;charset=utf-8,${encodeURIComponent("\uFEFF" + csv)}`;
}
