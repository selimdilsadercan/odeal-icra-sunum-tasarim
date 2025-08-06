'use client';

import { useState, useEffect } from 'react';
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
  Calendar
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
  const [outOfSprintItems, setOutOfSprintItems] = useState<OutOfSprintItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('2025-07');
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [configRes, completedRes, ongoingRes, incidentsRes, infraRes, securityRes, techOpsRes, outOfSprintRes] = await Promise.all([
          fetch(`/api/data?month=${selectedMonth}&type=config`),
          fetch(`/api/data?month=${selectedMonth}&type=completed-projects`),
          fetch(`/api/data?month=${selectedMonth}&type=ongoing-projects`),
          fetch(`/api/data?month=${selectedMonth}&type=incident-report`),
          fetch(`/api/data?month=${selectedMonth}&type=infra-devops`),
          fetch(`/api/data?month=${selectedMonth}&type=security`),
          fetch(`/api/data?month=${selectedMonth}&type=techops-recurring-tasks`),
          fetch(`/api/data?month=${selectedMonth}&type=out-of-sprint`)
        ]);

        const [configData, completedData, ongoingData, incidentsData, infraData, securityData, techOpsData, outOfSprintData] = await Promise.all([
          configRes.json(),
          completedRes.json(),
          ongoingRes.json(),
          incidentsRes.json(),
          infraRes.json(),
          securityRes.json(),
          techOpsRes.json(),
          outOfSprintRes.json()
        ]);

        setConfig(configData);
        setCompletedProjects(completedData);
        setOngoingProjects(ongoingData);
        setIncidents(incidentsData);
        setInfraDevOps(infraData);
        setSecurity(securityData);
        setTechOpsRecurringTasks(techOpsData);
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
                { id: 'performance', label: 'Performans', icon: Activity }
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
                    <div className="space-y-4">
                      {completedProjects.map((project, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{project["Başlık "]}</h4>
                            {project.Label && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {project.Label}
                              </span>
                            )}
                          </div>
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Bu ay tamamlanan proje bulunmamaktadır.</p>
                  )}
                </div>
              </div>

              {/* Recent Incidents */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Son Olaylar</h3>
                </div>
                <div className="p-6">
                  {incidents.length > 0 ? (
                    <div className="space-y-4">
                      {incidents.slice(0, 3).map((incident, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{incident.Konu}</h4>
                            <p className="text-sm text-gray-600">{incident.Takım} • {incident["Süre (.dk)"]} dakika</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {incident["Kök Sebep Kategorisi"]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Bu ay kayıtlı olay bulunmamaktadır.</p>
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
                  <div className="space-y-6">
                    {ongoingProjects.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">{project["Başlık "]}</h4>
                            {project["Güncellemesi"] && (
                              <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{project["Güncellemesi"]}</p>
                            )}
                            <div className="flex items-center space-x-4">
                              {project.Group && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {project.Group}
                                </span>
                              )}
                              {project.Tag && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {project.Tag}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ml-6 text-right">
                            {project.Statu && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.Statu)}`}>
                                {project.Statu}
                              </span>
                            )}
                            {project.Progress && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                  <span>İlerleme</span>
                                  <span>{project.Progress}</span>
                                </div>
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${getProgressColor(project.Progress)}`}
                                    style={{ width: project.Progress }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Incidents Section */}
            <section id="incidents" className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Olaylar</h2>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Olay Raporları</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {incidents.map((incident, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">{incident.Konu}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Takım:</span> {incident.Takım}
                              </div>
                              <div>
                                <span className="font-medium">Süre:</span> {incident["Süre (.dk)"]} dakika
                              </div>
                              <div>
                                <span className="font-medium">Kategori:</span> {incident["Kök Sebep Kategorisi"]}
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-gray-600">
                              <div><span className="font-medium">Başlangıç:</span> {incident.Başlangıç}</div>
                              <div><span className="font-medium">Bitiş:</span> {incident.Bitiş}</div>
                            </div>
                          </div>
                          <div className="ml-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              incident["Kök Sebep Kategorisi"] === 'Bug' ? 'bg-red-100 text-red-800' :
                              incident["Kök Sebep Kategorisi"] === 'Deploy' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {incident["Kök Sebep Kategorisi"]}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="space-y-6">
                    {infraDevOps.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">{project["Başlık "]}</h4>
                            <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{project["Güncellemesi"]}</p>
                          </div>
                          <div className="ml-6 text-right">
                            {project.Statü && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.Statü)}`}>
                                {project.Statü}
                              </span>
                            )}
                            {project["İlerleme Durumu"] && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                  <span>İlerleme</span>
                                  <span>{project["İlerleme Durumu"]}</span>
                                </div>
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${getProgressColor(project["İlerleme Durumu"])}`}
                                    style={{ width: project["İlerleme Durumu"] }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="space-y-6">
                    {security.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">{project["Başlık"]}</h4>
                            <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{project["Güncellemesi"]}</p>
                          </div>
                          <div className="ml-6 text-right">
                            {project.Statu && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.Statu)}`}>
                                {project.Statu}
                              </span>
                            )}
                            {project.Progress && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                  <span>İlerleme</span>
                                  <span>{project.Progress}</span>
                                </div>
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${getProgressColor(project.Progress)}`}
                                    style={{ width: project.Progress }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* TechOps Section */}
            <section id="techops" className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <Database className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">TechOps</h2>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
            </section>

            {/* Sprint Management Section */}
            <section id="sprint" className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <Calendar className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Sprint Yönetimi</h2>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Sprint Dışı Maddeler Analizi</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {Object.entries(processOutOfSprintData()).map(([team, sprintData]) => (
                      <div key={team} className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-medium text-gray-900 mb-4">{team}</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Sprint
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Sprint Dışı Madde Sayısı
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {Object.entries(sprintData).map(([sprint, count]) => (
                                <tr key={sprint} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {sprint}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      count > 10 ? 'bg-red-100 text-red-800' :
                                      count > 5 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {count}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Out-of-Sprint Items */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Detaylı Sprint Dışı Maddeler</h3>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Takım
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sprint
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tarih
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Madde
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {outOfSprintItems
                          .filter(item => typeof item["Sprint Dışı Maddeler/Sprint Dışı Eklenen Madde sayısı"] === 'string')
                          .map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.Takım || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.Sprint || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item["Sprint Tarihi /Sprinte Eklenme Tarihi"]}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="font-mono text-blue-600">
                                {item["Sprint Dışı Maddeler/Sprint Dışı Eklenen Madde sayısı"]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* Performance Section */}
            <section id="performance" className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <Activity className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Performans</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Metrics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performans Metrikleri</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <span className="font-semibold text-green-600">{config.uptime_percentage}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bug Fix Sayısı</span>
                      <span className="font-semibold text-blue-600">{config.number_of_bug_fixes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Deploy Sayısı</span>
                      <span className="font-semibold text-purple-600">{config.number_of_deployments}</span>
                    </div>
                  </div>
                </div>

                {/* Project Status Distribution */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Proje Durumu Dağılımı</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tamamlanan</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(config.number_of_completed_projects / (config.number_of_completed_projects + config.number_of_ongoing_projects)) * 100}%` }}></div>
                        </div>
                        <span className="font-semibold text-green-600">{config.number_of_completed_projects}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Devam Eden</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(config.number_of_ongoing_projects / (config.number_of_completed_projects + config.number_of_ongoing_projects)) * 100}%` }}></div>
                        </div>
                        <span className="font-semibold text-blue-600">{config.number_of_ongoing_projects}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}
