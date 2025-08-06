'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Server, 
  Shield, 
  Activity,
  Users,
  Code,
  Database,
  BarChart3,
  Calendar,
  FileText
} from 'lucide-react';

interface Config {
  target_year: number;
  target_month: number;
  target_month_name: string;
  number_of_completed_projects: number;
  number_of_ongoing_projects: number;
  uptime_percentage: string;
  number_of_bug_fixes: number;
  number_of_deployments: number;
}

interface Project {
  "Başlık ": string;
  "Güncellemesi"?: string;
  "Progress"?: string;
  "Statu"?: string;
  "Group"?: string;
  "Tag"?: string;
  "Label"?: string;
}

interface Incident {
  "Takım": string;
  "Süre (.dk)": number;
  "Başlangıç": string;
  "Bitiş": string;
  "Konu": string;
  "Ay": string;
  "Rapor": string;
  "Kök Sebep Kategorisi": string;
}

interface InfraDevOps {
  "Başlık ": string;
  "Güncellemesi": string;
  "İlerleme Durumu": string;
  "Statü": string;
}

interface Security {
  "Başlık": string;
  "Güncellemesi": string;
  "Progress": string;
  "Statu": string;
}

interface TechOpsRecurringTask {
  "Teknoloji İlgili Ekip": string;
  "Talep Sayısı ↓": number;
  "Tekrar Açılma": number;
  "Tekrar Açılma Oranı": string;
  "Risk Seviyesi": string;
}

interface TechOpsLifecycleTask {
  "Teknoloji İlgili Ekip": string;
  "Lead Ort. ↓": number;
  "Cycle Ort.": number;
  "Reaction Ort.": number;
}

interface OutOfSprintItem {
  "Sprint": string;
  "Sprint Tarihi /Sprinte Eklenme Tarihi": string;
  "Takım": string;
  "Sprint Dışı Maddeler/Sprint Dışı Eklenen Madde sayısı": string | number;
}

export default function Home() {
  const [config, setConfig] = useState<Config | null>(null);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<Project[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [infraDevOps, setInfraDevOps] = useState<InfraDevOps[]>([]);
  const [security, setSecurity] = useState<Security[]>([]);
  const [techOpsRecurringTasks, setTechOpsRecurringTasks] = useState<TechOpsRecurringTask[]>([]);
  const [techOpsLifecycleTasks, setTechOpsLifecycleTasks] = useState<TechOpsLifecycleTask[]>([]);
  const [outOfSprintItems, setOutOfSprintItems] = useState<OutOfSprintItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('2025-07');
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedTeam, setSelectedTeam] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [configRes, completedRes, ongoingRes, incidentsRes, infraRes, securityRes, techOpsRes, techOpsLifecycleRes, outOfSprintRes] = await Promise.all([
          fetch(`/api/data?month=${selectedMonth}&type=config`),
          fetch(`/api/data?month=${selectedMonth}&type=completed-projects`),
          fetch(`/api/data?month=${selectedMonth}&type=ongoing-projects`),
          fetch(`/api/data?month=${selectedMonth}&type=incident-report`),
          fetch(`/api/data?month=${selectedMonth}&type=infra-devops`),
          fetch(`/api/data?month=${selectedMonth}&type=security`),
          fetch(`/api/data?month=${selectedMonth}&type=techops-recurring-tasks`),
          fetch(`/api/data?month=${selectedMonth}&type=techops-lifecycle-tasks`),
          fetch(`/api/data?month=${selectedMonth}&type=out-of-sprint`)
        ]);

        const [configData, completedData, ongoingData, incidentsData, infraData, securityData, techOpsData, techOpsLifecycleData, outOfSprintData] = await Promise.all([
          configRes.json(),
          completedRes.json(),
          ongoingRes.json(),
          incidentsRes.json(),
          infraRes.json(),
          securityRes.json(),
          techOpsRes.json(),
          techOpsLifecycleRes.json(),
          outOfSprintRes.json()
        ]);

        setConfig(configData);
        setCompletedProjects(completedData);
        setOngoingProjects(ongoingData);
        setIncidents(incidentsData);
        setInfraDevOps(infraData);
        setSecurity(securityData);
        setTechOpsRecurringTasks(techOpsData);
        setTechOpsLifecycleTasks(techOpsLifecycleData);
        setOutOfSprintItems(outOfSprintData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedMonth]);

  // Intersection Observer for active section tracking
  useEffect(() => {
    const observerOptions = {
      rootMargin: '-10% 0px -80% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Wait for content to load and then observe sections
    const timer = setTimeout(() => {
      const sections = document.querySelectorAll('section[id]');
      sections.forEach((section) => observer.observe(section));
    }, 100);

    return () => {
      clearTimeout(timer);
      const sections = document.querySelectorAll('section[id]');
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [loading]); // Re-run when loading state changes

  // Manual scroll tracking as backup
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + 100; // Offset for better detection

      sections.forEach((section) => {
        const element = section as HTMLElement;
        const offsetTop = element.offsetTop;
        const offsetHeight = element.offsetHeight;

        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSection(element.id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'test':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: string) => {
    const percentage = parseInt(progress?.replace('%', '') || '0');
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'düşük':
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'orta':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'yüksek':
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTeamColor = (teamName: string) => {
    const teamColors: { [key: string]: string } = {
      'payment': 'bg-purple-100 text-purple-800 border-purple-200',
      'invoice': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'customer ops': 'bg-blue-100 text-blue-800 border-blue-200',
      'service banking': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'subscription': 'bg-teal-100 text-teal-800 border-teal-200',
      'finance': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'internal ops': 'bg-orange-100 text-orange-800 border-orange-200',
      'digital growth': 'bg-pink-100 text-pink-800 border-pink-200',
      'project & agile transformation': 'bg-violet-100 text-violet-800 border-violet-200',
      'ik onboarding': 'bg-rose-100 text-rose-800 border-rose-200',
      'tech team': 'bg-slate-100 text-slate-800 border-slate-200',
      'ai & data': 'bg-amber-100 text-amber-800 border-amber-200'
    };
    
    const normalizedTeam = teamName.toLowerCase();
    return teamColors[normalizedTeam] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Process out-of-sprint data to group by team and sprint
  const processOutOfSprintData = () => {
    const teamData: { [key: string]: { [key: string]: number } } = {};
    
    outOfSprintItems.forEach(item => {
      if (item.Takım && item.Sprint && typeof item["Sprint Dışı Maddeler/Sprint Dışı Eklenen Madde sayısı"] === 'number') {
        if (!teamData[item.Takım]) {
          teamData[item.Takım] = {};
        }
        teamData[item.Takım][item.Sprint] = item["Sprint Dışı Maddeler/Sprint Dışı Eklenen Madde sayısı"] as number;
      }
    });
    
    return teamData;
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      setActiveSection(sectionId); // Update active state immediately
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Veri yüklenemedi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Main Layout */}
      <div className="flex">
        {/* Table of Contents Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              Ödeal Teknoloji
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              {config.target_month_name} {config.target_year} - Aylık Yatırımcı Raporu
            </p>
            
            {/* Month Selector */}
            <div className="mb-4">
              <label htmlFor="month-select" className="block text-xs font-medium text-gray-700 mb-1">
                Ay Seçin:
              </label>
              <div className="relative">
                <select
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors duration-200 cursor-pointer"
                >
                  <option value="2025-07">Temmuz 2025</option>
                  <option value="2025-06">Haziran 2025</option>
                  <option value="2025-04">Nisan 2025</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Report Date */}
            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <p className="text-xs text-gray-500">Rapor Tarihi</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date().toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">İçindekiler</h2>
            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
                { id: 'projects', label: 'Projeler', icon: Code },
                { id: 'incidents', label: 'Olaylar', icon: AlertTriangle },
                { id: 'infrastructure', label: 'Altyapı', icon: Server },
                { id: 'security', label: 'Güvenlik', icon: Shield },
                { id: 'techops', label: 'TechOps', icon: Database },
                { id: 'sprint', label: 'Sprint Yönetimi', icon: Calendar },
              ].map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : ''}`} />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 ml-64">
          {/* Main Content */}
          <main className="p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Overview Section */}
            <section id="overview" className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Genel Bakış</h2>
              </div>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Tamamlanan Projeler</p>
                      <p className="text-2xl font-bold text-gray-900">{config.number_of_completed_projects}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Devam Eden Projeler</p>
                      <p className="text-2xl font-bold text-gray-900">{config.number_of_ongoing_projects}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Uptime</p>
                      <p className="text-2xl font-bold text-gray-900">{config.uptime_percentage}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Activity className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Deploy Sayısı</p>
                      <p className="text-2xl font-bold text-gray-900">{config.number_of_deployments}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Aylık Özet</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Başarılar</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {config.number_of_completed_projects} proje başarıyla tamamlandı
                        </li>
                        <li className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                          %{config.uptime_percentage} uptime oranı korundu
                        </li>
                        <li className="flex items-center">
                          <Activity className="h-4 w-4 text-green-500 mr-2" />
                          {config.number_of_deployments} başarılı deploy gerçekleştirildi
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Devam Eden Çalışmalar</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <Clock className="h-4 w-4 text-blue-500 mr-2" />
                          {config.number_of_ongoing_projects} aktif proje devam ediyor
                        </li>
                        <li className="flex items-center">
                          <Code className="h-4 w-4 text-blue-500 mr-2" />
                          {config.number_of_bug_fixes} bug fix işlemi tamamlandı
          </li>
                        <li className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                          {incidents.length} olay raporlandı ve çözüldü
          </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Completed Projects */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Tamamlanan Projeler</h3>
                </div>
                <div className="p-6">
                  {completedProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {completedProjects.map((project, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg mb-2 leading-tight">
                                {project["Başlık "]}
                              </h4>
                            </div>
                                                          <div className="ml-4">
                                {project.Label && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 group-hover:bg-blue-200 group-hover:border-blue-300 transition-colors duration-300">
                                    {project.Label.replace(/([a-zçğıöşü])([A-ZÇĞIİÖŞÜ])/g, '$1 $2')}
                                  </span>
                                )}
                              </div>
                          </div>
                         
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">Bu ay tamamlanan proje bulunmuyor</p>
                    </div>
                  )}
                </div>
              </div>


            </section>

            {/* Projects Section */}
            <section id="projects" className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <Code className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Projeler</h2>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Devam Eden Projeler</h3>
                </div>
                <div className="p-6">
                  {/* Team Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Takım Filtresi:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedTeam('all')}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${
                          selectedTeam === 'all'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        Tümü
                      </button>
                      {Array.from(new Set(ongoingProjects.map(p => p.Group).filter(Boolean))).map((team) => (
                        <button
                          key={team}
                          onClick={() => setSelectedTeam(team || '')}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${
                            selectedTeam === team
                              ? `${getTeamColor(team || '').replace('group-hover:opacity-80', '')}`
                              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {team}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ongoingProjects
                      .filter(project => project["Başlık "] && project["Başlık "].trim() !== '')
                      .filter(project => selectedTeam === 'all' || project.Group === selectedTeam)
                      .map((project, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.Group && (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors duration-300 group-hover:opacity-80 ${getTeamColor(project.Group)}`}>
                                  {project.Group}
                                </span>
                              )}
                              {project.Tag && (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors duration-300 group-hover:opacity-80 ${getTeamColor(project.Tag)}`}>
                                  {project.Tag.replace(/([a-zçğıöşü])([A-ZÇĞIİÖŞÜ])/g, '$1 $2')}
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-gray-900 text-lg mb-3 leading-tight">
                              {project["Başlık "]}
                            </h4>
                            {project["Güncellemesi"] && (
                              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                {project["Güncellemesi"]}
                              </p>
                            )}
                          </div>
                                                     <div className="mt-auto">
                             <div className="flex items-center justify-between mb-3">
                               {project.Statu && (
                                 <span className="text-sm text-gray-600">
                                   {project.Statu}
                                 </span>
                               )}
                               {project.Progress && (
                                 <span className="text-sm font-medium text-gray-700">
                                   {project.Progress.replace(/^%/, '').replace(/(\d+)$/, '$1%')}
                                 </span>
                               )}
                             </div>
                                                         {project.Progress && (
                               <div className="w-full bg-gray-200 rounded-full h-2">
                                 <div 
                                   className="h-2 rounded-full transition-all duration-300 bg-gray-400"
                                   style={{ width: `${parseInt(project.Progress.replace(/[^\d]/g, ''))}%` }}
                                 ></div>
                               </div>
                             )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {ongoingProjects.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">Devam eden proje bulunmuyor</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Incidents Section */}
            <section id="incidents" className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Olay Durumları</h2>
              </div>
 
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-8 w-8 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Toplam Olay</p>
                      <p className="text-2xl font-bold text-gray-900">{Array.isArray(incidents) ? incidents.length : 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Toplam Süre</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Array.isArray(incidents) ? incidents.reduce((sum, incident) => sum + incident["Süre (.dk)"], 0) : 0} dk
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">En Çok Etkilenen Takım</p>
                                              <p className="text-lg font-bold text-gray-900">
                          {(() => {
                            if (!Array.isArray(incidents) || incidents.length === 0) {
                              return 'Veri yok';
                            }
                            const teamCounts = incidents.reduce((acc, incident) => {
                              acc[incident.Takım] = (acc[incident.Takım] || 0) + 1;
                              return acc;
                            }, {} as { [key: string]: number });
                            
                            return Object.entries(teamCounts).reduce((a, b) => 
                              (teamCounts[a[0]] || 0) > (teamCounts[b[0]] || 0) ? a : b
                            )[0];
                          })()}
                        </p>
                    </div>
                  </div>
                </div>
              </div>

                            {/* Incident Analysis */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Olay Analizi</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Root Cause Analysis - Donut Chart */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Kök Sebep Analizi</h4>
                      <div className="flex items-center justify-center">
                        <div className="relative w-64 h-64">
                          {/* Donut Chart */}
                          <svg className="w-64 h-64" viewBox="0 0 100 100">
                            {(() => {
                              if (!Array.isArray(incidents) || incidents.length === 0) {
                                return null;
                              }
                              const rootCauseCounts = incidents.reduce((acc, incident) => {
                                acc[incident["Kök Sebep Kategorisi"]] = (acc[incident["Kök Sebep Kategorisi"]] || 0) + 1;
                                return acc;
                              }, {} as { [key: string]: number });
                              
                              const entries = Object.entries(rootCauseCounts);
                              const total = Object.values(rootCauseCounts).reduce((sum, val) => sum + val, 0);
                              
                              let currentAngle = -90; // Start from top
                              
                              return entries.map(([category, count], index) => {
                                const percentage = (count / total) * 100;
                                const angle = (percentage / 100) * 360;
                                
                                const colors = {
                                  'Bug': '#ef4444',
                                  'Deploy': '#f59e0b',
                                  'Thirdparty': '#8b5cf6'
                                };
                                
                                // Calculate arc path
                                const radius = 35;
                                const innerRadius = 20;
                                const centerX = 50;
                                const centerY = 50;
                                
                                const startAngleRad = (currentAngle * Math.PI) / 180;
                                const endAngleRad = ((currentAngle + angle) * Math.PI) / 180;
                                
                                const x1 = centerX + radius * Math.cos(startAngleRad);
                                const y1 = centerY + radius * Math.sin(startAngleRad);
                                const x2 = centerX + radius * Math.cos(endAngleRad);
                                const y2 = centerY + radius * Math.sin(endAngleRad);
                                
                                const innerX1 = centerX + innerRadius * Math.cos(startAngleRad);
                                const innerY1 = centerY + innerRadius * Math.sin(startAngleRad);
                                const innerX2 = centerX + innerRadius * Math.cos(endAngleRad);
                                const innerY2 = centerY + innerRadius * Math.sin(endAngleRad);
                                
                                const largeArcFlag = angle > 180 ? 1 : 0;
                                
                                const outerArc = `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
                                const innerArc = `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`;
                                
                                const pathData = `M ${x1} ${y1} ${outerArc} L ${innerX2} ${innerY2} ${innerArc} Z`;
                                
                                currentAngle += angle;
                                
                                return (
                                  <path
                                    key={category}
                                    d={pathData}
                                    fill={colors[category as keyof typeof colors] || '#6b7280'}
                                    stroke="white"
                                    strokeWidth="0.5"
                                  />
                                );
                              });
                            })()}
                          </svg>
                          
                          {/* Legend */}
                          <div className="absolute left-full ml-8 top-1/2 transform -translate-y-1/2 space-y-2">
                            {(() => {
                              if (!Array.isArray(incidents) || incidents.length === 0) {
                                return null;
                              }
                              const rootCauseCounts = incidents.reduce((acc, incident) => {
                                acc[incident["Kök Sebep Kategorisi"]] = (acc[incident["Kök Sebep Kategorisi"]] || 0) + 1;
                                return acc;
                              }, {} as { [key: string]: number });
                              
                              return Object.entries(rootCauseCounts).map(([category, count]) => (
                                <div key={category} className="flex items-center space-x-2">
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor: category === 'Bug' ? '#ef4444' : 
                                                       category === 'Deploy' ? '#f59e0b' : 
                                                       category === 'Thirdparty' ? '#8b5cf6' : '#6b7280'
                                    }}
                                  ></div>
                                  <span className="text-sm text-gray-600">{category}</span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Event Distribution - Bar Chart */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Aylık Olay Dağılımı</h4>
                      <div className="flex items-center justify-center">
                        <div className="relative w-full h-64">
                          {/* Bar Chart */}
                          <svg className="w-full h-64" viewBox="0 0 400 200">
                            {/* Grid lines */}
                            {(() => {
                              if (!Array.isArray(incidents) || incidents.length === 0) {
                                return null;
                              }
                              // Calculate max count for dynamic grid
                              const monthlyCounts = incidents.reduce((acc, incident) => {
                                const date = new Date(incident.Başlangıç);
                                const month = date.getMonth();
                                const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                                const monthName = monthNames[month];
                                
                                if (!acc[monthName]) {
                                  acc[monthName] = 0;
                                }
                                acc[monthName]++;
                                return acc;
                              }, {} as { [key: string]: number });
                              
                              const maxCount = Math.max(...Object.values(monthlyCounts), 1);
                              const gridSteps = Math.min(maxCount, 8); // Max 8 grid lines
                              const stepSize = Math.ceil(maxCount / gridSteps);
                              
                              return Array.from({ length: gridSteps + 1 }, (_, i) => {
                                const tick = i * stepSize;
                                return (
                                  <g key={tick}>
                                    <line
                                      x1="50"
                                      y1={200 - (tick * (160 / maxCount))}
                                      x2="350"
                                      y2={200 - (tick * (160 / maxCount))}
                                      stroke="#e5e7eb"
                                      strokeWidth="1"
                                    />
                                    <text
                                      x="40"
                                      y={200 - (tick * (160 / maxCount)) + 4}
                                      textAnchor="end"
                                      fontSize="10"
                                      fill="#6b7280"
                                    >
                                      {tick}
                                    </text>
                                  </g>
                                );
                              });
                            })()}
                            
                            {/* Y-axis label */}
                            <text
                              x="20"
                              y="100"
                              textAnchor="middle"
                              fontSize="12"
                              fill="#374151"
                              transform="rotate(-90, 20, 100)"
                            >
                              Olay Sayısı
                            </text>
                            
                            {/* X-axis */}
                            <line
                              x1="50"
                              y1="200"
                              x2="350"
                              y2="200"
                              stroke="#374151"
                              strokeWidth="2"
                            />
                            
                            {/* X-axis label */}
                            <text
                              x="200"
                              y="220"
                              textAnchor="middle"
                              fontSize="12"
                              fill="#374151"
                            >
                              Aylar
                            </text>
                            
                            {/* Bars */}
                            {(() => {
                              if (!Array.isArray(incidents) || incidents.length === 0) {
                                return null;
                              }
                              // Get monthly counts from actual data
                              const monthlyCounts = incidents.reduce((acc, incident) => {
                                const date = new Date(incident.Başlangıç);
                                const month = date.getMonth(); // 0-11
                                const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                                const monthName = monthNames[month];
                                
                                if (!acc[monthName]) {
                                  acc[monthName] = 0;
                                }
                                acc[monthName]++;
                                return acc;
                              }, {} as { [key: string]: number });
                              
                              // Get the last 6 months with data
                              const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                              const currentMonth = new Date().getMonth();
                              const last6Months = [];
                              
                              for (let i = 5; i >= 0; i--) {
                                const monthIndex = (currentMonth - i + 12) % 12;
                                const monthName = monthNames[monthIndex];
                                last6Months.push({
                                  month: monthName,
                                  count: monthlyCounts[monthName] || 0
                                });
                              }
                              
                              const maxCount = Math.max(...last6Months.map(m => m.count), 1); // At least 1 to avoid division by zero
                              const barWidth = 40;
                              const barSpacing = 10;
                              const startX = 70;
                              
                              return last6Months.map((data, index) => {
                                const x = startX + (index * (barWidth + barSpacing));
                                const height = (data.count / maxCount) * 160; // Max height is 160
                                const y = 200 - height;
                                
                                return (
                                  <g key={data.month}>
                                    <rect
                                      x={x}
                                      y={y}
                                      width={barWidth}
                                      height={height}
                                      fill="#60a5fa"
                                      rx="2"
                                    />
                                    <text
                                      x={x + barWidth / 2}
                                      y="215"
                                      textAnchor="middle"
                                      fontSize="10"
                                      fill="#374151"
                                    >
                                      {data.month}
                                    </text>
                                    <text
                                      x={x + barWidth / 2}
                                      y={y - 5}
                                      textAnchor="middle"
                                      fontSize="10"
                                      fill="#374151"
                                      fontWeight="bold"
                                    >
                                      {data.count}
                                    </text>
                                  </g>
                                );
                              });
                            })()}
                          </svg>
                          
                          {/* Legend */}
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
                            <div className="w-4 h-3 bg-blue-400 rounded"></div>
                            <span className="text-sm text-gray-600">Olay Sayısı</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Events Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Olay Detayları</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Takım
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Konu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kök Sebep
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Başlangıç
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bitiş
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Süre (dk)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rapor
                        </th>
                      </tr>
                    </thead>
                                          <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(incidents) && incidents.length > 0 ? (
                          incidents.map((incident, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTeamColor(incident.Takım)}`}>
                              {incident.Takım}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={incident.Konu}>
                              {incident.Konu}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              incident["Kök Sebep Kategorisi"] === 'Bug' ? 'bg-red-100 text-red-800 border-red-200' :
                              incident["Kök Sebep Kategorisi"] === 'Deploy' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              incident["Kök Sebep Kategorisi"] === 'Thirdparty' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {incident["Kök Sebep Kategorisi"]}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(incident.Başlangıç).toLocaleString('tr-TR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(incident.Bitiş).toLocaleString('tr-TR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {incident["Süre (.dk)"]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <a
                              href={incident.Rapor}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Gör
                            </a>
                          </td>
                        </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                              <div className="flex flex-col items-center">
                                <AlertTriangle className="w-8 h-8 text-gray-400 mb-2" />
                                <span>Olay bulunmuyor</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Infrastructure Section */}
            <section id="infrastructure" className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <Server className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Altyapı</h2>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Altyapı ve DevOps Projeleri</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {infraDevOps.map((project, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg mb-3 leading-tight">
                              {project["Başlık "]}
                            </h4>
                            {project["Güncellemesi"] && (
                              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                {project["Güncellemesi"]}
                              </p>
                            )}
                          </div>
                          <div className="mt-auto">
                            <div className="flex items-center justify-between mb-3">
                              {project.Statü && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-300 group-hover:opacity-80 ${getStatusColor(project.Statü)}`}>
                                  {project.Statü}
                                </span>
                              )}
                              {project["İlerleme Durumu"] && (
                                <span className="text-sm font-medium text-gray-700">
                                  {project["İlerleme Durumu"].replace(/^%/, '').replace(/(\d+)$/, '$1%')}
                                </span>
                              )}
                            </div>
                            {project["İlerleme Durumu"] && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-300 bg-gray-400"
                                  style={{ width: `${parseInt(project["İlerleme Durumu"].replace(/[^\d]/g, ''))}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {infraDevOps.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Server className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">Altyapı projesi bulunmuyor</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section id="security" className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Güvenlik</h2>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Güvenlik Projeleri</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {security.map((project, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg mb-3 leading-tight">
                              {project["Başlık"]}
                            </h4>
                            {project["Güncellemesi"] && (
                              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                {project["Güncellemesi"]}
                              </p>
                            )}
                          </div>
                          <div className="mt-auto">
                            <div className="flex items-center justify-between mb-3">
                              {project.Statu && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-300 group-hover:opacity-80 ${getStatusColor(project.Statu)}`}>
                                  {project.Statu}
                                </span>
                              )}
                              {project.Progress && (
                                <span className="text-sm font-medium text-gray-700">
                                  {project.Progress.replace(/^%/, '').replace(/(\d+)$/, '$1%')}
                                </span>
                              )}
                            </div>
                            {project.Progress && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-300 bg-gray-400"
                                  style={{ width: `${parseInt(project.Progress.replace(/[^\d]/g, ''))}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {security.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">Güvenlik projesi bulunmuyor</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* TechOps Section */}
            <section id="techops" className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <Database className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">TechOps</h2>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Tekrarlayan Görevler ve Risk Analizi</h3>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Teknoloji İlgili Ekip
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Talep Sayısı
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tekrar Açılma
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tekrar Açılma Oranı
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Risk Seviyesi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {techOpsRecurringTasks.map((task, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {task["Teknoloji İlgili Ekip"]}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {task["Talep Sayısı ↓"]}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {task["Tekrar Açılma"]}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {task["Tekrar Açılma Oranı"]}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(task["Risk Seviyesi"])}`}>
                                {task["Risk Seviyesi"]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Lifecycle Tasks Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Yaşam Döngüsü Görevleri</h3>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Teknoloji İlgili Ekip
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lead Ort. (gün)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cycle Ort. (gün)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reaction Ort. (gün)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(techOpsLifecycleTasks) && techOpsLifecycleTasks.length > 0 ? (
                          techOpsLifecycleTasks.map((task, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {task["Teknoloji İlgili Ekip"]}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {task["Lead Ort. ↓"].toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {task["Cycle Ort."].toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {task["Reaction Ort."].toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                              <div className="flex flex-col items-center">
                                <Database className="w-8 h-8 text-gray-400 mb-2" />
                                <span>Yaşam döngüsü görevi bulunmuyor</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* Sprint Management Section */}
            <section id="sprint" className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <Calendar className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Sprint Yönetimi</h2>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Sprint Dışı Maddeler</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(processOutOfSprintData())
                      .map(([team, sprintData]) => {
                        const totalCount = Object.values(sprintData).reduce((sum, count) => sum + count, 0);
                        return { team, totalCount };
                      })
                      .sort((a, b) => b.totalCount - a.totalCount)
                      .map(({ team, totalCount }) => {
                        const getCountColor = (count: number) => {
                        if (count >= 40) return 'bg-red-500';
                        if (count >= 20) return 'bg-orange-500';
                        if (count >= 10) return 'bg-yellow-500';
                        return 'bg-blue-500';
                      };
                        
                        return (
                          <div key={team} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300">
                            <div className="text-center">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${getCountColor(totalCount)}`}>
                                <span className="text-white font-bold text-xl">{totalCount}</span>
                              </div>
                              <h4 className="text-md font-semibold text-gray-900 mb-1">{team}</h4>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </section>
          <div className="h-60" />            
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}
