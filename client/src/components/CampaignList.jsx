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

const CHANNEL_LABELS = {
  search: 'Поиск',
  social: 'Соцсети',
  video: 'Видео',
  email: 'Email'
};

const STATUS_LABELS = {
  active: 'Активна',
  paused: 'Пауза',
  completed: 'Завершена'
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

function formatMoney(value) {
  return Number(value || 0).toLocaleString('ru-RU');
}

function formatPercent(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `${num.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}%`;
}

function spentShare(budget, spent) {
  const b = Number(budget) || 0;
  const s = Number(spent) || 0;
  if (b <= 0) return s > 0 ? 100 : 0;
  return Math.min(100, Math.round((s / b) * 100));
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
    document.title = loading ? 'Загрузка… | AdPulse' : `AdPulse · ${items.length} кампаний`;
  }, [items.length, loading]);

  const stats = useMemo(() => {
    const totalBudget = items.reduce((sum, item) => sum + Number(item.budget || 0), 0);
    const totalSpent = items.reduce((sum, item) => sum + Number(item.spent || 0), 0);
    const activeCount = items.filter((item) => item.status === 'active').length;
    const rois = items.map((item) => Number(item.roi)).filter((v) => !Number.isNaN(v));
    const avgRoi = rois.length
      ? rois.reduce((sum, v) => sum + v, 0) / rois.length
      : null;
    return { total: items.length, activeCount, totalBudget, totalSpent, avgRoi };
  }, [items]);

  const visibleItems = useMemo(() => {
    let list = [...items];
    if (statusFilter !== 'all') {
      list = list.filter((item) => item.status === statusFilter);
    }
    list.sort((a, b) => {
      if (sortBy === 'budget') return Number(b.budget) - Number(a.budget);
      if (sortBy === 'roi') return Number(b.roi || 0) - Number(a.roi || 0);
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
        setItems((prev) =>
          prev.map((item) => (item.id === editId || item.id === response.data.id ? response.data : item))
        );
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
      <header className="brand-panel">
        <div>
          <p className="brand-kicker">AdPulse Analytics</p>
          <h1>Рекламные кампании</h1>
          <p className="subtitle">
            Живая панель эффективности: бюджет, расход, ROI и статусы — данные с REST API
            (PostgreSQL + JWT).
          </p>
        </div>
        <div className="brand-meta">
          <span>
            <span className={`auth-dot ${token ? 'on' : ''}`} />
            {token ? 'Сессия активна' : 'Гость · только просмотр'}
          </span>
          <span>API · localhost:3000</span>
        </div>
      </header>

      <form className="login-bar" onSubmit={handleLogin}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@lab.local" />
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        <div className="field-actions">
          <button type="submit">Войти</button>
          {token && (
            <button type="button" className="secondary" onClick={handleLogout}>
              Выйти
            </button>
          )}
        </div>
      </form>

      {notice && <p className="autosave">{notice}</p>}
      {error && (
        <div className="error-box">
          <p>{error}</p>
          <button type="button" className="ghost" onClick={loadCampaigns}>
            Повторить
          </button>
        </div>
      )}

      <section className="stats" aria-label="Сводка">
        <div className="stat">
          <span className="stat-label">Кампаний</span>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat">
          <span className="stat-label">Активные</span>
          <div className="stat-value">{stats.activeCount}</div>
        </div>
        <div className="stat">
          <span className="stat-label">Бюджет</span>
          <div className="stat-value">
            {formatMoney(stats.totalBudget)} <em>₽</em>
          </div>
        </div>
        <div className="stat">
          <span className="stat-label">{stats.avgRoi != null ? 'Средний ROI' : 'Потрачено'}</span>
          <div className="stat-value">
            {stats.avgRoi != null ? (
              <>
                {formatPercent(stats.avgRoi)}
              </>
            ) : (
              <>
                {formatMoney(stats.totalSpent)} <em>₽</em>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="workspace">
        <section className="controls">
          <label>
            Фильтр по статусу
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Все статусы</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status] || status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Сортировка
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">По названию</option>
              <option value="budget">По бюджету</option>
              <option value="roi">По ROI</option>
            </select>
          </label>
        </section>

        <form className="campaign-form" onSubmit={handleSubmit}>
          <h2>{editId ? 'Редактирование кампании' : 'Новая кампания'}</h2>
          <p className="form-hint">
            {token
              ? 'Изменения сразу уходят на сервер. Удаление доступно администратору.'
              : 'Для создания и правок нужна авторизация.'}
          </p>
          <label>
            Название
            <input
              type="text"
              placeholder="Например, Google Search Q3"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </label>
          <label>
            Канал
            <select
              value={form.channel}
              onChange={(e) => setForm((prev) => ({ ...prev, channel: e.target.value }))}
            >
              {CHANNELS.map((channel) => (
                <option key={channel} value={channel}>
                  {CHANNEL_LABELS[channel] || channel}
                </option>
              ))}
            </select>
          </label>
          <label>
            Бюджет
            <input
              type="number"
              placeholder="0"
              value={form.budget}
              onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
            />
          </label>
          <label>
            Потрачено
            <input
              type="number"
              placeholder="0"
              value={form.spent}
              onChange={(e) => setForm((prev) => ({ ...prev, spent: e.target.value }))}
            />
          </label>
          <label>
            Статус
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status] || status}
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions">
            <button type="submit">{editId ? 'Сохранить' : 'Добавить'}</button>
            {editId && (
              <button type="button" className="secondary" onClick={resetForm}>
                Отмена
              </button>
            )}
          </div>
        </form>

        <section>
          <div className="list-head">
            <h2>Список кампаний</h2>
            <span>
              Показано {visibleItems.length} из {items.length}
            </span>
          </div>

          {loading ? (
            <p className="loading">Загрузка кампаний с сервера…</p>
          ) : visibleItems.length === 0 ? (
            <p className="empty-state">Нет кампаний по выбранному фильтру.</p>
          ) : (
            <ul className="campaign-list">
              {visibleItems.map((item) => {
                const share = spentShare(item.budget, item.spent);
                const over = Number(item.spent) > Number(item.budget) && Number(item.budget) > 0;
                return (
                  <li
                    key={item.id}
                    className={`campaign-item is-${item.status || 'active'}`}
                  >
                    <div>
                      <div className="item-top">
                        <strong>{item.name}</strong>
                        <span className="tag tag-channel">
                          {CHANNEL_LABELS[item.channel] || item.channel}
                        </span>
                        <span className={`tag tag-status ${item.status || ''}`}>
                          {STATUS_LABELS[item.status] || item.status}
                        </span>
                      </div>

                      <div className="metrics-row">
                        <div className="metric">
                          <span>Бюджет</span>
                          <b>{formatMoney(item.budget)} ₽</b>
                        </div>
                        <div className="metric">
                          <span>Потрачено</span>
                          <b>{formatMoney(item.spent)} ₽</b>
                        </div>
                        <div className="metric">
                          <span>ROI</span>
                          <b>{item.roi != null ? formatPercent(item.roi) : '—'}</b>
                        </div>
                        <div className="metric">
                          <span>CPC</span>
                          <b>{item.cpc != null ? `${formatMoney(item.cpc)} ₽` : '—'}</b>
                        </div>
                      </div>

                      <div className="budget-track" aria-hidden="true">
                        <div
                          className={`budget-fill${over ? ' over' : ''}`}
                          style={{ width: `${share}%` }}
                        />
                      </div>
                      <div className="budget-caption">
                        <span>Освоение бюджета</span>
                        <span>{share}%</span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button type="button" className="ghost" onClick={() => handleEdit(item)}>
                        Изменить
                      </button>
                      <button type="button" className="danger" onClick={() => handleDelete(item.id)}>
                        Удалить
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
