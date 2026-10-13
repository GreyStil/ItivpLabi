import { useEffect, useMemo, useState } from 'react';
import {
  CHANNELS,
  DEFAULT_CAMPAIGNS,
  STATUSES
} from '../data/defaultCampaigns';
import { useLocalStorage } from '../hooks/useLocalStorage';

const STORAGE_KEY = 'ad-campaigns-v1';

const emptyForm = {
  name: '',
  channel: 'search',
  budget: '',
  spent: '',
  status: 'active'
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export default function CampaignList() {
  const [items, setItems, isHydrated] = useLocalStorage(STORAGE_KEY, DEFAULT_CAMPAIGNS);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [isLoading, setIsLoading] = useState(true);
  const [autosaveText, setAutosaveText] = useState('');

  // Имитация загрузки с сервера при старте
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Заголовок вкладки от количества кампаний
  useEffect(() => {
    document.title = `Campaigns (${items.length}) | Analytics`;
    return () => {
      document.title = 'Campaign Analytics';
    };
  }, [items.length]);

  // Debounce-индикатор автосохранения (500 мс)
  useEffect(() => {
    if (!isHydrated || isLoading) return;

    setAutosaveText('Сохранение...');
    const timer = setTimeout(() => {
      setAutosaveText(`Автосохранено в localStorage (${new Date().toLocaleTimeString()})`);
    }, 500);

    return () => clearTimeout(timer);
  }, [items, isHydrated, isLoading]);

  const stats = useMemo(() => {
    const totalBudget = items.reduce((sum, item) => sum + Number(item.budget || 0), 0);
    const activeCount = items.filter((item) => item.status === 'active').length;
    return { total: items.length, activeCount, totalBudget };
  }, [items]);

  const visibleItems = useMemo(() => {
    let list = [...items];

    if (statusFilter !== 'all') {
      list = list.filter((item) => item.status === statusFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'budget') {
        return Number(b.budget) - Number(a.budget);
      }
      return a.name.localeCompare(b.name, 'ru');
    });

    return list;
  }, [items, sortBy, statusFilter]);

  function resetForm() {
    setForm(emptyForm);
    setEditId(null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) return;

    const payload = {
      id: editId ?? createId(),
      name: form.name.trim(),
      channel: form.channel,
      budget: Number(form.budget) || 0,
      spent: Number(form.spent) || 0,
      status: form.status
    };

    if (editId) {
      setItems((prev) => prev.map((item) => (item.id === editId ? payload : item)));
    } else {
      setItems((prev) => [...prev, payload]);
    }

    resetForm();
  }

  function handleEdit(item) {
    setEditId(item.id);
    setForm({
      name: item.name,
      channel: item.channel,
      budget: String(item.budget),
      spent: String(item.spent),
      status: item.status
    });
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editId === id) resetForm();
  }

  if (isLoading) {
    return <p className="loading">Загрузка кампаний...</p>;
  }

  return (
    <div className="app-shell">
      <header>
        <h1>Рекламные кампании</h1>
        <p className="subtitle">Клиентская часть курсового проекта (localStorage)</p>
        <p className="autosave">{autosaveText}</p>
      </header>

      <section className="stats">
        <div>Всего: {stats.total}</div>
        <div>Active: {stats.activeCount}</div>
        <div>Бюджет: {stats.totalBudget.toLocaleString('ru-RU')} BYN</div>
      </section>

      <section className="controls">
        <label>
          Фильтр по статусу
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Все</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label>
          Сортировка
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">По названию</option>
            <option value="budget">По бюджету</option>
          </select>
        </label>
      </section>

      <form className="campaign-form" onSubmit={handleSubmit}>
        <h2>{editId ? 'Редактирование кампании' : 'Новая кампания'}</h2>
        <input
          type="text"
          placeholder="Название"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        />
        <select
          value={form.channel}
          onChange={(e) => setForm((prev) => ({ ...prev, channel: e.target.value }))}
        >
          {CHANNELS.map((channel) => (
            <option key={channel} value={channel}>
              {channel}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Бюджет"
          value={form.budget}
          onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
        />
        <input
          type="number"
          placeholder="Потрачено"
          value={form.spent}
          onChange={(e) => setForm((prev) => ({ ...prev, spent: e.target.value }))}
        />
        <select
          value={form.status}
          onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <div className="form-actions">
          <button type="submit">{editId ? 'Сохранить' : 'Добавить'}</button>
          {editId && (
            <button type="button" className="secondary" onClick={resetForm}>
              Отмена
            </button>
          )}
        </div>
      </form>

      <ul className="campaign-list">
        {visibleItems.map((item) => (
          <li key={item.id} className="campaign-item">
            <div>
              <strong>{item.name}</strong>
              <p>
                {item.channel} | budget: {item.budget} | spent: {item.spent} | {item.status}
              </p>
            </div>
            <div className="item-actions">
              <button type="button" onClick={() => handleEdit(item)}>
                Edit
              </button>
              <button type="button" className="danger" onClick={() => handleDelete(item.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
