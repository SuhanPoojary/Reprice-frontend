import Papa from "papaparse";

export function parsePhonesCSV(csvText: string) {
  return new Promise<any[]>((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (err) => reject(err),
    });
  });
}
