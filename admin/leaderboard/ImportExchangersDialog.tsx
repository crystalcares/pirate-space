import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Download, Upload } from 'lucide-react';

interface ImportExchangersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: any[]) => Promise<void>;
}

export default function ImportExchangersDialog({ open, onOpenChange, onImport }: ImportExchangersDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImportClick = async () => {
    if (!file) {
      toast.error('Please select a CSV file to import.');
      return;
    }

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const requiredFields = ['name', 'title', 'volume', 'order'];
          const firstRow = results.data[0] as any;
          if (!firstRow || !requiredFields.every(field => field in firstRow)) {
            throw new Error(`CSV must contain the following headers: ${requiredFields.join(', ')}.`);
          }
          await onImport(results.data);
          onOpenChange(false);
          setFile(null);
        } catch (error: any) {
          toast.error(`Import failed: ${error.message}`);
        } finally {
          setIsImporting(false);
        }
      },
      error: (error: any) => {
        toast.error(`CSV parsing error: ${error.message}`);
        setIsImporting(false);
      },
    });
  };

  const handleDownloadTemplate = () => {
    const csvContent = "name,title,volume,order,avatar_url\nCaptain Jack,Black Pearl,50000,1,https://example.com/avatar.png\nWill Turner,Flying Dutchman,45000,2,";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = 'exchangers_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Exchangers from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-add or update manually curated exchangers. This will replace all existing manual entries.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Download a template to get started.</p>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Template
            </Button>
          </div>
          <div className="space-y-2">
            <label htmlFor="csv-upload" className="text-sm font-medium">Upload CSV File</label>
            <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleImportClick} disabled={!file || isImporting}>
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
