import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { Layout } from '@/shared/layout/Layout';
import { Panel } from '@/shared/components/ui/Panel';
import { Button } from '@/shared/components/ui/Button';
import { AlertPanel } from '@/shared/components/ui/AlertPanel';
import { RuleCard } from '@/features/rules/components/RuleCard';
import { AddRuleForm } from '@/features/rules/components/AddRuleForm';
import { getRules, createRule, deleteRule } from '@/features/rules/api/rulesApi';
import { ApiError } from '@/lib/api';
import { RuleItem } from '@/shared/types/models';
import { ConfirmModal } from '@/shared/components/ui/ConfirmModal';
import { StatCard } from '@/shared/components/ui/StatCard';
import { RefreshCw, X, Plus, Radio, Send, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Dashboard() {
  const { pin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('monitor');
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(() => window.innerWidth > 768);
  const [ruleToDelete, setRuleToDelete] = useState<RuleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        setErrorMsg('Unable to connect to server.');
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

  const handleAddRule = async (url: string, maxPrice: number | null) => {
    setErrorMsg(null);
    const tempId = `temp-${Date.now()}`;
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const tempRule: RuleItem = {
      id: tempId,
      url,
      maxPrice,
      createdAt: nowIso,
    };

    setRules((prevRules) => [tempRule, ...prevRules]);

    try {
      await createRule(url, maxPrice, pin);
      await fetchRulesData(false);
    } catch (err) {
      setRules((prevRules) => prevRules.filter((r) => r.id !== tempId));

      if (err instanceof ApiError && err.status === 401) {
        logout();
        return;
      }
      const message = err instanceof Error ? err.message : 'Server rejected request';
      setErrorMsg(`Failed to create rule: ${message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!ruleToDelete) return;
    const targetId = ruleToDelete.id;
    const targetRule = ruleToDelete;
    setRuleToDelete(null);
    setIsDeleting(true);
    setErrorMsg(null);

    setRules((prevRules) => prevRules.filter((r) => r.id !== targetId));

    try {
      await deleteRule(targetId, pin);
      await fetchRulesData(false);
    } catch (err) {
      setRules((prevRules) => {
        if (prevRules.some((r) => r.id === targetId)) return prevRules;
        return [...prevRules, targetRule];
      });

      if (err instanceof ApiError && err.status === 401) {
        logout();
        return;
      }
      const message = err instanceof Error ? err.message : 'Server rejected request';
      setErrorMsg(`Failed to delete rule: ${message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'monitor' && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <StatCard
              label="Active Rules"
              value={rules.length}
              subtext="Monitoring 24/7"
              icon={Radio}
              variant="green"
            />
            <StatCard
              label="Alert Delivery"
              value="Telegram"
              subtext="Instant notifications"
              icon={Send}
              variant="purple"
            />
            <StatCard
              label="Engine Status"
              value="30s Poll"
              subtext="Auto-sync active"
              icon={Activity}
              variant="blue"
            />
          </div>

          {errorMsg && (
            <AlertPanel
              message={errorMsg}
              onRetry={() => fetchRulesData(false)}
              isRetrying={isRefreshing}
            />
          )}

          <Panel
            title="Active Rules"
            action={
              <button
                onClick={() => setIsAddRuleOpen((prev) => !prev)}
                style={{
                  background: isAddRuleOpen ? 'rgba(255, 7, 58, 0.15)' : 'rgba(57, 255, 20, 0.15)',
                  border: `1px solid ${isAddRuleOpen ? 'var(--neon-red)' : 'var(--neon-green)'}`,
                  color: isAddRuleOpen ? 'var(--neon-red)' : 'var(--neon-green)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isAddRuleOpen
                    ? '0 0 10px rgba(255, 7, 58, 0.3)'
                    : '0 0 10px rgba(57, 255, 20, 0.3)',
                }}
                title={isAddRuleOpen ? 'Close Form' : 'Add Rule'}
              >
                {isAddRuleOpen ? <X size={20} /> : <Plus size={20} />}
              </button>
            }
          >
            <AnimatePresence initial={false}>
              {isAddRuleOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px dashed var(--text-muted)' }}
                >
                  <AddRuleForm onAddRule={(url, maxPrice) => {
                    handleAddRule(url, maxPrice);
                    if (window.innerWidth <= 768) {
                      setIsAddRuleOpen(false);
                    }
                  }} />
                </motion.div>
              )}
            </AnimatePresence>

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
                  Active rules: {rules.length}
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
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {isLoading ? (
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
                    No active monitoring rules found.
                  </p>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {rules.map((rule) => (
                      <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, x: -20 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        layout
                      >
                        <RuleCard rule={rule} onDelete={() => setRuleToDelete(rule)} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </Panel>
          </>
        )}

      {activeTab === 'logs' && (
        <Panel title="System Logs">
          <p style={{ color: 'var(--neon-purple)', marginBottom: '0.8rem' }}>
            Monitoring engine running normally.
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
        <Panel title="Settings">
          <p style={{ color: 'var(--text-main)', marginBottom: '0.8rem' }}>
            System Configuration
          </p>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.8' }}>
            <div>Telegram Notifications: Enabled</div>
            <div>Auto-Poll Interval: 30 Seconds</div>
            <div>Theme: Neon Dark</div>
          </div>
        </Panel>
      )}

      <ConfirmModal
        isOpen={Boolean(ruleToDelete)}
        title="Delete Search Rule"
        message={
          ruleToDelete
            ? `Are you sure you want to delete the search rule for "${ruleToDelete.url.substring(0, 50)}..."?`
            : ''
        }
        confirmLabel="Delete Rule"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setRuleToDelete(null)}
        isLoading={isDeleting}
      />
    </Layout>
  );
}
