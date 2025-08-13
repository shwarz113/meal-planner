import { Link, useLocation } from "wouter";
import { Calendar, Utensils, ShoppingBasket } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const tabs = [
    {
      id: "planning",
      path: "/planning",
      icon: Calendar,
      label: "Планирование",
    },
    {
      id: "dishes",
      path: "/dishes",
      icon: Utensils,
      label: "Блюда",
    },
    {
      id: "shopping",
      path: "/shopping",
      icon: ShoppingBasket,
      label: "Покупки",
    },
  ];

  const getTabPath = (path: string) => {
    if (path === "/planning") return "/";
    return path;
  };

  const isActive = (path: string) => {
    if (path === "/planning") {
      return location === "/" || location === "/planning";
    }
    return location === path;
  };

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 border-t border-gray-200 z-50">
      <div className="grid grid-cols-3 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <Link
              key={tab.id}
              href={getTabPath(tab.path)}
              className={`flex flex-col items-center justify-center transition-colors ${
                active
                  ? "text-primary bg-blue-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Icon className="text-lg mb-1" size={20} />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
