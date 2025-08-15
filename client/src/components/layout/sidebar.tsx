import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Calendar, BarChart3, CheckSquare, GraduationCap, BookOpen, UserCircle } from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    current: true,
  },
  {
    name: "Cronograma",
    href: "/cronograma",
    icon: Calendar,
    current: false,
  },
  {
    name: "Tarefas",
    href: "/tarefas",
    icon: CheckSquare,
    current: false,
  },
  {
    name: "Notas",
    href: "/notas",
    icon: GraduationCap,
    current: false,
  },
  {
    name: "Disciplinas",
    href: "/disciplinas",
    icon: BookOpen,
    current: false,
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="bg-white shadow-lg w-64 fixed h-full z-30" data-testid="sidebar">
      {/* User Profile */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <UserCircle className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800" data-testid="text-username">
              João Silva
            </h2>
            <p className="text-sm text-gray-500" data-testid="text-semester">
              6º Semestre
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-6 py-3 font-medium transition-colors",
                isActive
                  ? "text-primary bg-primary/10 border-r-2 border-primary"
                  : "text-gray-600 hover:text-primary hover:bg-primary/5"
              )}
              data-testid={`nav-link-${item.name.toLowerCase()}`}
            >
              <Icon className="mr-3 h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
