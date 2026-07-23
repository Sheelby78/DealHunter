import { useState } from 'react';
import { Layout } from '@/shared/layout/Layout';
import { Panel } from '@/shared/components/ui/Panel';
import { RuleCard } from '@/features/rules/components/RuleCard';
import { AddRuleForm } from '@/features/rules/components/AddRuleForm';
import { RuleItem } from '@/shared/types/theme';

export default function App() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [rules, setRules] = useState<RuleItem[]>([
    {
      id: 'RL-8F39',
      url: 'https://www.olx.pl/elektronika/telefony/apple/?search%5Bfilter_float_price:to%5D=2000',
      maxPrice: 2000,
      createdAt: '2026-07-23 18:30:00',
    },
    {
      id: 'RL-2A1B',
      url: 'https://www.olx.pl/muzyka-edukacja/instrumenty/gitary/',
      maxPrice: null,
      createdAt: '2026-07-23 18:45:00',
    },
  ]);

  const handleAddRule = (url: string, maxPrice: number | null) => {
    const newRule: RuleItem = {
      id: `RL-${Math.random().toString(16).substring(2, 6).toUpperCase()}`,
      url,
      maxPrice,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setRules((prev) => [newRule, ...prev]);
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'monitor' && (
        <>
          <Panel title="INITIATE_NEW_PROTOCOL">
            <AddRuleForm onAddRule={handleAddRule} />
          </Panel>

          <Panel title="ACTIVE_MONITORING_RULES">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {rules.length === 0 ? (
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
            <div>AUTO_POLL_INTERVAL: 60 SECONDS</div>
            <div>CYBERPUNK_THEME: ULTRA_NEON_v1</div>
          </div>
        </Panel>
      )}
    </Layout>
  );
}
