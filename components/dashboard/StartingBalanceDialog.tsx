import { useState } from "react";

import { Save, Settings } from "lucide-react";

import useSettings from "@/hooks/use-settings";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const StartingBalanceDialog = ({ balance }: { balance: number }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [startingBalance, setStartingBalance] = useState(balance);
  const {
    handlers: { updateSettingsKey },
  } = useSettings();
  const handleSaveStartingBalance = async () => {
    try {
      const balance = startingBalance || 0;
      await updateSettingsKey("startingBalance", balance);
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving starting balance:", error);
    }
  };
  return (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dashboard Settings</DialogTitle>
          <DialogDescription>
            Set your starting balance from the previous year or period
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="starting-balance">Starting Balance (€)</Label>
            <Input
              id="starting-balance"
              type="number"
              step="1000"
              placeholder="0.00"
              value={startingBalance}
              onChange={(e) => setStartingBalance(Number.parseFloat(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Enter the amount of money you had before starting to track with this app
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveStartingBalance}>
            <Save className="w-4 h-4 mr-2" />
            Save Starting Balance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartingBalanceDialog;
