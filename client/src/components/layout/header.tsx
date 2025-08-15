import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";
import { getCurrentWeekString } from "@/lib/date-utils";

export default function Header() {
  const currentWeek = getCurrentWeekString();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800" data-testid="header-title">
            Dashboard Acadêmico
          </h1>
          <p className="text-gray-600 mt-1" data-testid="text-currentweek">
            {currentWeek}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="relative text-gray-600 hover:text-primary"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-600 hover:text-primary"
            data-testid="button-settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
