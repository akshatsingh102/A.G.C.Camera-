'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCameraStore } from '@/lib/store';
import { FILTERS, RESOLUTIONS } from '@/lib/constants';
import clsx from 'clsx';

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const { settings, updateSettings } = useCameraStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold text-white">Settings</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <Section title="Appearance">
          <Toggle
            label="Dark Mode"
            checked={settings.darkMode}
            onChange={(v) => updateSettings({ darkMode: v })}
          />
          <Select
            label="Camera Theme"
            value={settings.theme}
            options={[
              { value: 'minimal', label: 'Minimal' },
              { value: 'iphone', label: 'iPhone Style' },
              { value: 'samsung', label: 'Samsung Style' },
            ]}
            onChange={(v) => updateSettings({ theme: v as any })}
          />
        </Section>

        <Section title="Capture">
          <Select
            label="Resolution"
            value={settings.resolution}
            options={Object.entries(RESOLUTIONS).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
            onChange={(v) => updateSettings({ resolution: v as any })}
          />
        </Section>

        <Section title="Filters">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => updateSettings({ filter: f.id })}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm transition-colors',
                  settings.filter === f.id
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Upper Buttons">
          <p className="text-white/60 text-xs mb-3">
            Choose which buttons to show in the top bar
          </p>
          <Toggle
            label="Flash"
            checked={settings.upperButtons?.flash ?? true}
            onChange={(v) =>
              updateSettings({
                upperButtons: {
                  flash: v,
                  grid: settings.upperButtons?.grid ?? true,
                  timer: settings.upperButtons?.timer ?? true,
                  gallery: settings.upperButtons?.gallery ?? true,
                },
              })
            }
          />
          <Toggle
            label="Grid"
            checked={settings.upperButtons?.grid ?? true}
            onChange={(v) =>
              updateSettings({
                upperButtons: {
                  flash: settings.upperButtons?.flash ?? true,
                  grid: v,
                  timer: settings.upperButtons?.timer ?? true,
                  gallery: settings.upperButtons?.gallery ?? true,
                },
              })
            }
          />
          <Toggle
            label="Timer"
            checked={settings.upperButtons?.timer ?? true}
            onChange={(v) =>
              updateSettings({
                upperButtons: {
                  flash: settings.upperButtons?.flash ?? true,
                  grid: settings.upperButtons?.grid ?? true,
                  timer: v,
                  gallery: settings.upperButtons?.gallery ?? true,
                },
              })
            }
          />
          <Toggle
            label="Gallery Thumbnail"
            checked={settings.upperButtons?.gallery ?? true}
            onChange={(v) =>
              updateSettings({
                upperButtons: {
                  flash: settings.upperButtons?.flash ?? true,
                  grid: settings.upperButtons?.grid ?? true,
                  timer: settings.upperButtons?.timer ?? true,
                  gallery: v,
                },
              })
            }
          />
        </Section>

        <Section title="AI Features">
          <Toggle
            label="Face Detection + Focus"
            checked={settings.aiFaceDetection}
            onChange={(v) => updateSettings({ aiFaceDetection: v })}
          />
          <Toggle
            label="Scene Detection"
            checked={settings.aiSceneDetection}
            onChange={(v) => updateSettings({ aiSceneDetection: v })}
          />
          <Toggle
            label="Auto Enhance (Brightness + Contrast)"
            checked={settings.aiEnhance}
            onChange={(v) => updateSettings({ aiEnhance: v })}
          />
          <Toggle
            label="Video Stabilization"
            checked={settings.aiStabilization}
            onChange={(v) => updateSettings({ aiStabilization: v })}
          />
        </Section>
      </div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-white/70 text-sm font-medium mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-white">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative w-12 h-7 rounded-full transition-colors flex items-center',
          checked ? 'bg-green-500' : 'bg-white/20'
        )}
      >
        <div
          className={clsx(
            'absolute w-5 h-5 rounded-full bg-white transition-all',
            checked ? 'left-6' : 'left-1'
          )}
        />
      </button>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="py-2">
      <span className="text-white block mb-2">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-gray-900">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
