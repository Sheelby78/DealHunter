import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { Layout } from '@/shared/layout/Layout';
import { Panel } from '@/shared/components/ui/Panel';
import { Button } from '@/shared/components/ui/Button';
import { AlertPanel } from '@/shared/components/ui/AlertPanel';
import { RuleCard } from '@/features/rules/components/RuleCard';
import { AddRuleForm } from '@/features/rules/components/AddRuleForm';
import { getRules } from '@/features/rules/api/rulesApi';
import { ApiError } from '@/lib/api';
import { RuleItem } from '@/shared/types/models';
import { RefreshCw } from 'lucide-react';

export function Dashboard() {
  const { pin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('monitor');
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchRulesData = useCallback(
    async (isInitial = false) => {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setErrorMsg(null);

      try {
        const fetchedRules = await getRules(pin);
        setRules(fetchedRules);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setErrorMsg('BACKEND_SERVICE_UNAVAILABLE // SERVER UNREACHABLE');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [pin, logout]
  );

  useEffect(() => {
    fetchRulesData(true);

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchRulesData(false);
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchRulesData]);

  const handleAddRule = (url: string, maxPrice: number | null) => {
    alert("NOT_IMPLEMENTED // BACKEND MUTATION OFFLINE UNTIL PHASE S-06");
  };

  const handleDeleteRule = (id: string) => {
    alert("NOT_IMPLEMENTED // BACKEND MUTATION OFFLINE UNTIL PHASE S-06");
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'monitor' && (
        <>
          <Panel title="INITIATE_NEW_PROTOCOL">
            <AddRuleForm onAddRule={handleAddRule} />
          </Panel>

          {errorMsg ? (
            <AlertPanel
              message={errorMsg}
              onRetry={() => fetchRulesData(false)}
              isRetrying={isRefreshing}
            />
          ) : (
            <Panel title="ACTIVE_MONITORING_RULES">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <span
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  TOTAL ACTIVE: {rules.length}
                </span>

                <Button
                  variant="ghost"
                  onClick={() => fetchRulesData(false)}
                  disabled={isRefreshing || isLoading}
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <RefreshCw
                    size={14}
                    className={isRefreshing ? 'spin-animation' : ''}
                  />
                  {isRefreshing ? '[ POLLING... ]' : '[ REFRESH_DATA ]'}
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {isLoading ? (
                  /* Loading Skeletons */
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '1.2rem',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px dashed var(--text-muted)',
                        opacity: 0.6,
                      }}
                    >
                      <div
                        style={{
                          height: '16px',
                          width: '40%',
                          background: 'var(--text-muted)',
                          marginBottom: '0.8rem',
                        }}
                      />
                      <div
                        style={{
                          height: '14px',
                          width: '80%',
                          background: 'rgba(255, 255, 255, 0.1)',
                        }}
                      />
                    </div>
                  ))
                ) : rules.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>
                    &gt; NO ACTIVE RULES FOUND IN DATABASE.
                  </p>
                ) : (
                  rules.map((rule) => (
                    <RuleCard key={rule.id} rule={rule} onDelete={handleDeleteRule} />
                  ))
                )}
              </div>
            </Panel>
          )}
        </>
      )}

      {activeTab === 'logs' && (
        <Panel title="SYSTEM_LOGS">
          <p style={{ color: 'var(--neon-purple)' }}>
            &gt; LOG STREAM ACTIVE. MONITORING ENGINE RUNNING AT 100% HEALTH.
          </p>
          <div
            style={{
              background: 'rgba(0,0,0,0.5)',
              padding: '1rem',
              borderRadius: '4px',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              lineHeight: '1.6',
            }}
          >
            <div>[2026-07-23 19:55:01] INFO: Engine poll tick complete. 0 new matches.</div>
            <div>[2026-07-23 19:50:01] INFO: Engine poll tick complete. 1 match detected and dispatched to Telegram.</div>
            <div>[2026-07-23 19:45:01] INFO: Engine poll tick complete. 0 new matches.</div>
          </div>
        </Panel>
      )}

      {activeTab === 'settings' && (
        <Panel title="SYSTEM_SETTINGS">
          <p style={{ color: 'var(--text-main)' }}>
            &gt; SYSTEM CONFIGURATION PROTOCOLS ONLINE.
          </p>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <div>TELEGRAM_NOTIFICATIONS: ENABLED</div>
            <div>AUTO_POLL_INTERVAL: 30 SECONDS</div>
            <div>CYBERPUNK_THEME: ULTRA_NEON_v1</div>
          </div>
        </Panel>
      )}
    </Layout>
  );
}
