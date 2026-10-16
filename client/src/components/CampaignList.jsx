import { useEffect, useMemo, useState } from 'react';
import {
  addCampaign,
  deleteCampaign,
  fetchCampaigns,
  getErrorMessage,
  login,
  updateCampaign
} from '../api';
import { CHANNELS, STATUSES } from '../data/defaultCampaigns';

const emptyForm = {
  name: '',
  channel: 'search',
  budget: '',
  spent: '',
  status: 'active'
};

function toPayload(form) {
  return {
    name: form.name.trim(),
    channel: form.channel,
    budget: Number(form.budget) || 0,
    spent: Number(form.spent) || 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
    status: form.status,
    priority: 1
  };
}

export default function CampaignList() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('admin@lab.local');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  async function loadCampaigns() {
    setLoading(true);
    setError('');
    try {
      const response = await fetchCampaigns();
      setItems(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    document.title = loading ? 'Загрузка кампаний...' : `Campaigns (${items.length}) | API`;
  }, [items.length, loading]);

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
      if (sortBy === 'budget') return Number(b.budget) - Number(a.budget);
      return String(a.name).localeCompare(String(b.name), 'ru');
    });
    return list;
  }, [items, sortBy, statusFilter]);

  function resetForm() {
    setForm(emptyForm);
    setEditId(null);
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    try {
      const response = await login(email, password);
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setNotice(`Вход выполнен: ${response.data.user.email} (${response.data.user.role})`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken('');
    setNotice('Вы вышли из системы');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    if (!token) {
      setError('Для изменения данных войдите в систему');
      return;
    }

    const payload = toPayload(form);

    if (editId) {
      const previous = items;
      setItems((prev) => prev.map((item) => (item.id === editId ? { ...item, ...payload } : item)));
      resetForm();
      try {
        const response = await updateCampaign(editId, payload);
        setItems((prev) => prev.map((item) => (item.id === editId || item.id === response.data.id ? response.data : item)));
        setNotice('Кампания обновлена');
      } catch (err) {
        setItems(previous);
        setError(getErrorMessage(err));
      }
      return;
    }

    const tempId = `tmp-${Date.now()}`;
    const optimistic = { id: tempId, ...payload };
    setItems((prev) => [...prev, optimistic]);
    resetForm();

    try {
      const response = await addCampaign(payload);
      setItems((prev) => prev.map((item) => (item.id === tempId ? response.data : item)));
      setNotice('Кампания добавлена');
    } catch (err) {
      setItems((prev) => prev.filter((item) => item.id !== tempId));
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(id) {
    if (!token) {
      setError('Для удаления войдите как администратор');
      return;
    }

    const previous = items;
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editId === id) resetForm();

    try {
      await deleteCampaign(id);
      setNotice('Кампания удалена');
    } catch (err) {
      setItems(previous);
      setError(getErrorMessage(err));
    }
  }

  function handleEdit(item) {
    setEditId(item.id);
    setForm({
      name: item.name,
      channel: item.channel,
      budget: String(item.budget ?? ''),
      spent: String(item.spent ?? ''),
      status: item.status || 'active'
    });
  }

  return (
    <div className="app-shell">
      <header>
        <h1>Рекламные кампании</h1>
        <p className="subtitle">Клиент React подключён к REST API (PostgreSQL + JWT)</p>
      </header>

      <form className="login-bar" onSubmit={handleLogin}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="пароль"
        />
        <button type="submit">Войти</button>
        {token && (
          <button type="button" className="secondary" onClick={handleLogout}>
            Выйти
          </button>
        )}
      </form>

      {notice && <p className="autosave">{notice}</p>}
      {error && (
        <div className="error-box">
          <p>{error}</p>
          <button type="button" onClick={loadCampaigns}>
            Повторить
          </button>
        </div>
      )}

      <section className="stats">
        <div>Всего: {stats.total}</div>
        <div>Active: {stats.activeCount}</div>
        <div>Бюджет: {stats.totalBudget.toLocaleString('ru-RU')}</div>
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

      {loading ? (
        <p className="loading">Загрузка кампаний с сервера...</p>
      ) : (
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
      )}
    </div>
  );
}
