import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Download, FileJson, FileText, FileArchive, Files } from "lucide-react";

interface ExportProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string | null;
  onExport: (profileId: string, options: ExportOptions) => void;
}

interface ExportOptions {
  format: "json" | "csv" | "txt" | "zip";
  includeHistory: boolean;
  includeCookies: boolean;
  includeProxySettings: boolean;
  includeFingerprint: boolean;
}

export function ExportProfileDialog({
  open,
  onOpenChange,
  profileId,
  onExport,
}: ExportProfileDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: "json",
    includeHistory: true,
    includeCookies: true,
    includeProxySettings: true,
    includeFingerprint: true,
  });

  const handleExport = () => {
    if (profileId) {
      onExport(profileId, options);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Profile
          </DialogTitle>
          <DialogDescription>
            Export browser profile with customized options
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          <div>
            <h3 className="text-sm font-medium mb-3">Export Format</h3>
            <RadioGroup
              value={options.format}
              onValueChange={(value) => setOptions((prev) => ({ ...prev, format: value as ExportOptions["format"] }))}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center cursor-pointer">
                  <FileJson className="h-4 w-4 mr-2 text-blue-500" />
                  JSON
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center cursor-pointer">
                  <Files className="h-4 w-4 mr-2 text-green-500" />
                  CSV
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="txt" id="txt" />
                <Label htmlFor="txt" className="flex items-center cursor-pointer">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  Text
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="zip" id="zip" />
                <Label htmlFor="zip" className="flex items-center cursor-pointer">
                  <FileArchive className="h-4 w-4 mr-2 text-yellow-500" />
                  ZIP
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Export Options</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="includeHistory"
                  checked={options.includeHistory}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, includeHistory: checked === true }))
                  }
                  className="mt-0.5"
                />
                <div className="grid gap-1">
                  <Label htmlFor="includeHistory">Include browsing history</Label>
                  <p className="text-xs text-muted-foreground">
                    Export visited pages and navigation history
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="includeCookies"
                  checked={options.includeCookies}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, includeCookies: checked === true }))
                  }
                  className="mt-0.5"
                />
                <div className="grid gap-1">
                  <Label htmlFor="includeCookies">Include cookies</Label>
                  <p className="text-xs text-muted-foreground">
                    Export all stored cookies and site data
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="includeProxySettings"
                  checked={options.includeProxySettings}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, includeProxySettings: checked === true }))
                  }
                  className="mt-0.5"
                />
                <div className="grid gap-1">
                  <Label htmlFor="includeProxySettings">Include proxy settings</Label>
                  <p className="text-xs text-muted-foreground">
                    Export proxy configuration and connection details
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="includeFingerprint"
                  checked={options.includeFingerprint}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, includeFingerprint: checked === true }))
                  }
                  className="mt-0.5"
                />
                <div className="grid gap-1">
                  <Label htmlFor="includeFingerprint">Include fingerprint data</Label>
                  <p className="text-xs text-muted-foreground">
                    Export browser fingerprinting settings and user-agent data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}