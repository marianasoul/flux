import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, BookOpen, CheckCircle, FileText, StickyNote, Clock } from "lucide-react";
import type { ClassWithSubject, StudyPlan } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const DAYS_OF_WEEK = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export default function Planejamento() {
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [planData, setPlanData] = useState({
    preStudy: "",
    postStudy: "",
    resources: "",
    notes: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: classes, isLoading } = useQuery<ClassWithSubject[]>({
    queryKey: ['/api/classes'],
  });

  const { data: studyPlans } = useQuery<StudyPlan[]>({
    queryKey: ['/api/study-plans'],
  });

  const updateStudyPlanMutation = useMutation({
    mutationFn: async (data: { classId: string; plan: Partial<StudyPlan> }) => {
      await apiRequest("POST", `/api/study-plans/${data.classId}`, data.plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-plans'] });
      setEditingPlan(null);
      toast({
        title: "Sucesso",
        description: "Planejamento de estudo atualizado!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar planejamento",
        variant: "destructive",
      });
    },
  });

  const getClassesForDay = (dayName: string) => {
    return classes?.filter(c => c.dayOfWeek === dayName).sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    ) || [];
  };

  const getStudyPlanForClass = (classId: string) => {
    return studyPlans?.find(p => p.classId === classId) || {
      preStudy: "",
      postStudy: "",
      resources: "",
      notes: ""
    };
  };

  const handleEditPlan = (classId: string) => {
    const existingPlan = getStudyPlanForClass(classId);
    setPlanData({
      preStudy: existingPlan.preStudy || "",
      postStudy: existingPlan.postStudy || "",
      resources: existingPlan.resources || "",
      notes: existingPlan.notes || ""
    });
    setEditingPlan(classId);
  };

  const handleSavePlan = (classId: string) => {
    updateStudyPlanMutation.mutate({
      classId,
      plan: planData
    });
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
    setPlanData({ preStudy: "", postStudy: "", resources: "", notes: "" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Carregando planejamento...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background" data-testid="planejamento-container">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Planejamento de Estudos</h1>
            <p className="text-gray-600 mt-2">Organize seus estudos pré e pós-aula para cada disciplina</p>
          </div>

          <div className="space-y-6">
            {DAYS_OF_WEEK.map(day => {
              const dayClasses = getClassesForDay(day);
              
              if (dayClasses.length === 0) return null;
              
              return (
                <Card key={day} className="border-2">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {day}
                      <Badge variant="secondary" className="ml-auto">
                        {dayClasses.length} aulas
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dayClasses.map(classItem => {
                      const studyPlan = getStudyPlanForClass(classItem.id);
                      const isExpanded = expandedClass === classItem.id;
                      const isEditing = editingPlan === classItem.id;
                      
                      return (
                        <Collapsible
                          key={classItem.id}
                          open={isExpanded}
                          onOpenChange={(open) => setExpandedClass(open ? classItem.id : null)}
                        >
                          <Card className="border border-gray-200 hover:shadow-sm transition-shadow">
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-4 h-4 rounded-full"
                                      style={{ backgroundColor: classItem.subject.color }}
                                    />
                                    <div>
                                      <h3 className="font-semibold text-gray-900">
                                        {classItem.subject.name}
                                      </h3>
                                      <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span>{classItem.startTime} - {classItem.endTime}</span>
                                        <Badge variant="outline">{classItem.type}</Badge>
                                        {classItem.location && <span>📍 {classItem.location}</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {(studyPlan.preStudy || studyPlan.postStudy || studyPlan.resources || studyPlan.notes) && (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                    {isExpanded ? 
                                      <ChevronUp className="h-4 w-4 text-gray-500" /> :
                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                    }
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <CardContent className="pt-0">
                                <div className="space-y-4">
                                  {!isEditing ? (
                                    <>
                                      {/* Pre-Study Section */}
                                      <div className="border-l-4 border-l-blue-500 pl-4 bg-blue-50 p-3 rounded-r">
                                        <div className="flex items-center gap-2 mb-2">
                                          <BookOpen className="h-4 w-4 text-blue-600" />
                                          <h4 className="font-medium text-blue-900">O que estudar ANTES da aula</h4>
                                        </div>
                                        <p className="text-sm text-blue-800 whitespace-pre-wrap">
                                          {studyPlan.preStudy || "Nenhum planejamento pré-aula definido."}
                                        </p>
                                      </div>

                                      {/* Post-Study Section */}
                                      <div className="border-l-4 border-l-green-500 pl-4 bg-green-50 p-3 rounded-r">
                                        <div className="flex items-center gap-2 mb-2">
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                          <h4 className="font-medium text-green-900">O que revisar DEPOIS da aula</h4>
                                        </div>
                                        <p className="text-sm text-green-800 whitespace-pre-wrap">
                                          {studyPlan.postStudy || "Nenhum planejamento pós-aula definido."}
                                        </p>
                                      </div>

                                      {/* Resources Section */}
                                      <div className="border-l-4 border-l-yellow-500 pl-4 bg-yellow-50 p-3 rounded-r">
                                        <div className="flex items-center gap-2 mb-2">
                                          <FileText className="h-4 w-4 text-yellow-600" />
                                          <h4 className="font-medium text-yellow-900">Materiais e Referências</h4>
                                        </div>
                                        <p className="text-sm text-yellow-800 whitespace-pre-wrap">
                                          {studyPlan.resources || "Nenhum material definido."}
                                        </p>
                                      </div>

                                      {/* Notes Section */}
                                      <div className="border-l-4 border-l-purple-500 pl-4 bg-purple-50 p-3 rounded-r">
                                        <div className="flex items-center gap-2 mb-2">
                                          <StickyNote className="h-4 w-4 text-purple-600" />
                                          <h4 className="font-medium text-purple-900">Observações Importantes</h4>
                                        </div>
                                        <p className="text-sm text-purple-800 whitespace-pre-wrap">
                                          {studyPlan.notes || "Nenhuma observação adicionada."}
                                        </p>
                                      </div>

                                      <div className="pt-4 border-t border-gray-200">
                                        <Button 
                                          onClick={() => handleEditPlan(classItem.id)}
                                          variant="outline"
                                          size="sm"
                                          data-testid={`button-edit-plan-${classItem.id}`}
                                        >
                                          ✏️ Editar Planejamento
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      {/* Editing Mode */}
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium text-blue-900 mb-2">
                                            📚 O que estudar ANTES da aula
                                          </label>
                                          <Textarea
                                            value={planData.preStudy}
                                            onChange={(e) => setPlanData({...planData, preStudy: e.target.value})}
                                            placeholder="Ex: Ler capítulo 3 do livro de Anatomia, revisar slides da aula anterior..."
                                            className="border-blue-200 focus:border-blue-500"
                                            rows={3}
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-sm font-medium text-green-900 mb-2">
                                            ✅ O que revisar DEPOIS da aula
                                          </label>
                                          <Textarea
                                            value={planData.postStudy}
                                            onChange={(e) => setPlanData({...planData, postStudy: e.target.value})}
                                            placeholder="Ex: Fazer exercícios do capítulo, resumir pontos principais, criar flashcards..."
                                            className="border-green-200 focus:border-green-500"
                                            rows={3}
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-sm font-medium text-yellow-900 mb-2">
                                            📖 Materiais e Referências
                                          </label>
                                          <Textarea
                                            value={planData.resources}
                                            onChange={(e) => setPlanData({...planData, resources: e.target.value})}
                                            placeholder="Ex: Livro Sobotta, artigo sobre sistema cardiovascular, vídeo aula YouTube..."
                                            className="border-yellow-200 focus:border-yellow-500"
                                            rows={3}
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-sm font-medium text-purple-900 mb-2">
                                            📝 Observações Importantes
                                          </label>
                                          <Textarea
                                            value={planData.notes}
                                            onChange={(e) => setPlanData({...planData, notes: e.target.value})}
                                            placeholder="Ex: Prova na próxima semana, levar jaleco para laboratório..."
                                            className="border-purple-200 focus:border-purple-500"
                                            rows={2}
                                          />
                                        </div>

                                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                                          <Button 
                                            onClick={() => handleSavePlan(classItem.id)}
                                            disabled={updateStudyPlanMutation.isPending}
                                            size="sm"
                                            data-testid={`button-save-plan-${classItem.id}`}
                                          >
                                            💾 Salvar
                                          </Button>
                                          <Button 
                                            onClick={handleCancelEdit}
                                            variant="outline"
                                            size="sm"
                                            data-testid={`button-cancel-plan-${classItem.id}`}
                                          >
                                            ❌ Cancelar
                                          </Button>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}