import type { Tab } from "../types";

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "habits", label: "habits" },
  { id: "stats", label: "stats" },
  { id: "profile", label: "profile" },
];

export default function TabNav({ active, onChange }: Props) {
  return (
    <nav className="tabnav" role="tablist" aria-label="Navigation">
      {TABS.map(t => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={`tabnav-tab ${active === t.id ? "tabnav-tab-active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
