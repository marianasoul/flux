import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, Calendar, CheckCircle } from "lucide-react";

interface StatsCardsProps {
  stats: {
    pendingTasks: number;
    generalAverage: number;
    weeklyClasses: number;
    weeklyProgress: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
  } | undefined;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Tarefas Pendentes",
      value: stats.pendingTasks,
      icon: Clock,
      color: "warning",
      change: "+2",
      changeText: "desde ontem",
      testId: "stat-pending-tasks"
    },
    {
      title: "Média Geral",
      value: stats.generalAverage.toFixed(1),
      icon: TrendingUp,
      color: "secondary",
      change: "+0.2",
      changeText: "este mês",
      testId: "stat-general-average"
    },
    {
      title: "Aulas esta Semana",
      value: stats.weeklyClasses,
      icon: Calendar,
      color: "primary",
      change: "6 disciplinas ativas",
      changeText: "",
      testId: "stat-weekly-classes"
    },
    {
      title: "Progresso Semanal",
      value: `${stats.weeklyProgress}%`,
      icon: CheckCircle,
      color: "secondary",
      change: "",
      changeText: "",
      showProgress: true,
      progress: stats.weeklyProgress,
      testId: "stat-weekly-progress"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        const colorClasses = {
          warning: "bg-warning/10 text-warning",
          secondary: "bg-secondary/10 text-secondary", 
          primary: "bg-primary/10 text-primary",
        }[stat.color];

        return (
          <Card key={stat.title} className="bg-white shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2" data-testid={stat.testId}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              
              {stat.showProgress ? (
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-secondary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              ) : (
                <div className="mt-4 flex items-center text-sm">
                  {stat.change && (
                    <span className={`font-medium ${stat.color === 'warning' ? 'text-warning' : 'text-secondary'}`}>
                      {stat.change}
                    </span>
                  )}
                  {stat.changeText && (
                    <span className="text-gray-600 ml-1">{stat.changeText}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
