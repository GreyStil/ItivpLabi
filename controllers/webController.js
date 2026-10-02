const model = require('../models/campaignModel');
const authService = require('../services/authService');
const { renderWithLayout } = require('../utils/renderLayout');
const { setAuthCookie, clearAuthCookie } = require('../middleware/auth');

function listItems(req, res, next) {
  try {
    const { channel, status, from, to } = req.query;
    let items = model.getAll();

    if (channel) items = items.filter((c) => c.channel === channel);
    if (status) items = items.filter((c) => c.status === status);

    renderWithLayout(res, 'pages/index', {
      title: 'Кампании',
      items,
      filters: { channel, status, from, to }
    });
  } catch (err) {
    next(err);
  }
}

function showItem(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(404);
      return renderWithLayout(res, 'pages/not-found', {
        url: req.originalUrl,
        title: '404'
      });
    }
    const item = model.getById(id);
    if (!item) {
      res.status(404);
      return renderWithLayout(res, 'pages/not-found', {
        url: req.originalUrl,
        title: '404'
      });
    }
    renderWithLayout(res, 'pages/item', { title: item.name, item });
  } catch (err) {
    next(err);
  }
}

function showAddForm(req, res, next) {
  try {
    renderWithLayout(res, 'pages/add', { title: 'Добавить кампанию' });
  } catch (err) {
    next(err);
  }
}

function createItem(req, res, next) {
  try {
    const { name, channel, budget, spent, clicks, conversions, revenue, status } =
      req.body;
    model.add({
      name,
      channel,
      budget: Number(budget) || 0,
      spent: Number(spent) || 0,
      clicks: Number(clicks) || 0,
      conversions: Number(conversions) || 0,
      revenue: Number(revenue) || 0,
      status: status || 'active'
    });
    res.redirect('/');
  } catch (err) {
    next(err);
  }
}

function showLogin(req, res, next) {
  try {
    if (req.user && req.user.id) {
      return res.redirect('/');
    }
    renderWithLayout(res, 'pages/login', {
      title: 'Вход',
      error: null,
      email: ''
    });
  } catch (err) {
    next(err);
  }
}

async function submitLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    setAuthCookie(res, result.token);
    res.redirect('/');
  } catch (err) {
    renderWithLayout(res, 'pages/login', {
      title: 'Вход',
      error: err.message || 'Ошибка входа',
      email: req.body.email || ''
    });
  }
}

function showRegister(req, res, next) {
  try {
    if (req.user && req.user.id) {
      return res.redirect('/');
    }
    renderWithLayout(res, 'pages/register', {
      title: 'Регистрация',
      error: null,
      email: ''
    });
  } catch (err) {
    next(err);
  }
}

async function submitRegister(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.register({ email, password });
    setAuthCookie(res, result.token);
    res.redirect('/');
  } catch (err) {
    renderWithLayout(res, 'pages/register', {
      title: 'Регистрация',
      error: err.message || 'Ошибка регистрации',
      email: req.body.email || ''
    });
  }
}

function logout(req, res) {
  clearAuthCookie(res);
  res.redirect('/');
}

module.exports = {
  listItems,
  showItem,
  showAddForm,
  createItem,
  showLogin,
  submitLogin,
  showRegister,
  submitRegister,
  logout
};
