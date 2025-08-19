
import { CsvColumnMapper } from '@/components/upload/CsvColumnMapper';

export function CSVStandardizer() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Standardize CSV</h1>
      <CsvColumnMapper />
    </div>
  );
}
