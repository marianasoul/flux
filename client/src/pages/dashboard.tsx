import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import WeeklyCalendar from "@/components/dashboard/weekly-calendar";
import TasksSidebar from "@/components/dashboard/tasks-sidebar";
import ProgressSection from "@/components/dashboard/progress-section";
import QuickActions from "@/components/dashboard/quick-actions";
import TaskModal from "@/components/modals/task-modal";
import ClassModal from "@/components/modals/class-modal";
import GradeModal from "@/components/modals/grade-modal";
import SubjectModal from "@/components/modals/subject-modal";
import { useState } from "react";

type ModalType = 'task' | 'class' | 'grade' | 'subject' | null;

export default function Dashboard() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['/api/classes'],
  });

  const { data: urgentTasks, isLoading: urgentTasksLoading } = useQuery({
    queryKey: ['/api/tasks/urgent'],
  });

  const { data: subjectsWithStats, isLoading: subjectsLoading } = useQuery({
    queryKey: ['/api/subjects/stats'],
  });

  const { data: recentGrades, isLoading: gradesLoading } = useQuery({
    queryKey: ['/api/grades/recent'],
    search: { limit: '5' },
  });

  const { data: overallAverage } = useQuery({
    queryKey: ['/api/grades/average/overall'],
  });

  const openModal = (type: ModalType) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const isLoading = statsLoading || classesLoading || urgentTasksLoading || subjectsLoading || gradesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background" data-testid="dashboard-container">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6 space-y-6">
          <StatsCards stats={stats} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <WeeklyCalendar classes={classes || []} />
            <TasksSidebar tasks={urgentTasks || []} onAddTask={() => openModal('task')} />
          </div>

          <ProgressSection 
            subjects={subjectsWithStats || []} 
            recentGrades={recentGrades || []} 
            overallAverage={overallAverage?.average || 0}
            onAddGrade={() => openModal('grade')}
          />

          <QuickActions onActionClick={openModal} />
        </main>
      </div>

      {/* Modals */}
      <TaskModal 
        isOpen={activeModal === 'task'} 
        onClose={closeModal} 
      />
      <ClassModal 
        isOpen={activeModal === 'class'} 
        onClose={closeModal} 
      />
      <GradeModal 
        isOpen={activeModal === 'grade'} 
        onClose={closeModal} 
      />
      <SubjectModal 
        isOpen={activeModal === 'subject'} 
        onClose={closeModal} 
      />
    </div>
  );
}
