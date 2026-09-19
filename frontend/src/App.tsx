import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { CheckIn } from './pages/CheckIn';
import { ReMind } from './pages/ReMind';
import { Tasks } from './pages/Tasks';
import { Insights } from './pages/Insights';
import { Interventions } from './pages/Interventions';
import { Simulator } from './pages/Simulator';
import { Settings } from './pages/Settings';
import { AIPage } from './features/ai/AIPage';
import { ChatbotPage } from './features/chatbot/ChatbotPage';
import { ProactiveModal } from './components/ProactiveModal';
import { HelplineModal } from './components/HelplineModal';
import { DashboardData } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [demoMode, setDemoMode] = useState<'normal' | 'stressful'>('stressful');
  const [showInterventionModal, setShowInterventionModal] = useState<boolean>(false);
  const [showHelplineModal, setShowHelplineModal] = useState<boolean>(false);
  const crunchAlertedRef = useRef<boolean>(false);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDashboard();
      setDashboardData(data);
      // Auto-trigger helpline modal when crunch mode is active (once per session)
      if (data.is_crunch_mode && !crunchAlertedRef.current) {
        crunchAlertedRef.current = true;
        setShowHelplineModal(true);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSeedDemo = async (mode: 'normal' | 'stressful') => {
    try {
      setIsSeeding(true);
      setDemoMode(mode);
      await api.seedDemo(mode);
      await loadDashboard();
    } catch (err) {
      console.error('Failed to seed demo:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAcceptIntervention = async (id: number) => {
    try {
      await api.takeInterventionAction(id, 'accept');
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissIntervention = async (id: number) => {
    try {
      await api.takeInterventionAction(id, 'dismiss');
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitFeedback = async (id: number, rating: number, helpful: string, feedback?: string) => {
    try {
      await api.submitInterventionFeedback(id, rating, helpful, feedback);
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileUpdated = (newName: string) => {
    setDashboardData(prev => prev ? { ...prev, user_name: newName } : prev);
    loadDashboard();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        status={dashboardData?.status}
        onSeedDemo={handleSeedDemo}
        isSeeding={isSeeding}
        demoMode={demoMode}
        userName={dashboardData?.user_name}
      />

      {/* Main body layout: Sidebar + Main Content Container */}
      <div style={{ display: 'flex', flex: 1, padding: '0 1.25rem 2rem 1.25rem', gap: '1.25rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          status={dashboardData?.status}
        />

        <main style={{ flex: 1, minWidth: 0 }}>
          {currentTab === 'dashboard' && (
            <Dashboard
              data={dashboardData}
              onNavigate={setCurrentTab}
              onOpenIntervention={() => setShowInterventionModal(true)}
              isLoading={isLoading}
            />
          )}

          {currentTab === 'checkin' && (
            <CheckIn
              onSuccess={() => {
                loadDashboard();
                setCurrentTab('dashboard');
              }}
            />
          )}

          {currentTab === 'remind' && <ReMind />}

          {currentTab === 'tasks' && <Tasks />}

          {currentTab === 'insights' && <Insights />}

          {currentTab === 'interventions' && <Interventions />}

          {currentTab === 'simulator' && <Simulator />}
          {currentTab === 'ai' && <AIPage />}
          {currentTab === 'chatbot' && <ChatbotPage />}

          {currentTab === 'settings' && (
            <Settings
              onResetData={() => {
                loadDashboard();
                setCurrentTab('dashboard');
              }}
              onProfileUpdated={handleProfileUpdated}
            />
          )}
        </main>
      </div>

      {/* Proactive Intervention Modal if opened */}
      {showInterventionModal && dashboardData?.active_intervention && (
        <ProactiveModal
          intervention={dashboardData.active_intervention}
          onAccept={handleAcceptIntervention}
          onDismiss={handleDismissIntervention}
          onSubmitFeedback={handleSubmitFeedback}
          onClose={() => setShowInterventionModal(false)}
        />
      )}

      {/* Helpline Modal — shown on crunch mode or manually */}
      {showHelplineModal && (
        <HelplineModal
          isCrunchMode={dashboardData?.is_crunch_mode}
          onClose={() => setShowHelplineModal(false)}
        />
      )}
    </div>
  );
};
export default App;
