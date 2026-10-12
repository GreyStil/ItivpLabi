const ALLOWED_STATUS = new Set(['active', 'paused']);
const MAX_NAME_LEN = 200;
const MAX_CHANNEL_LEN = 80;
const MAX_MONEY = 1_000_000_000;
const MAX_COUNT = 1_000_000_000;

function parseRequiredMoney(raw, label, errors) {
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    errors.push(`${label}: поле обязательно.`);
    return null;
  }
  const num = Number(raw);
  if (!Number.isFinite(num)) {
    errors.push(`${label}: укажите число.`);
    return null;
  }
  if (num < 0) {
    errors.push(`${label}: не может быть отрицательным.`);
    return null;
  }
  if (num > MAX_MONEY) {
    errors.push(`${label}: слишком большое значение.`);
    return null;
  }
  return Math.round(num * 100) / 100;
}

function parseRequiredInt(raw, label, errors) {
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    errors.push(`${label}: поле обязательно.`);
    return null;
  }
  const num = Number(raw);
  if (!Number.isInteger(num) || !Number.isFinite(num)) {
    errors.push(`${label}: укажите целое число.`);
    return null;
  }
  if (num < 0) {
    errors.push(`${label}: не может быть отрицательным.`);
    return null;
  }
  if (num > MAX_COUNT) {
    errors.push(`${label}: слишком большое значение.`);
    return null;
  }
  return num;
}

function validateCampaignForm(body) {
  const errors = [];
  const form = {
    name: typeof body.name === 'string' ? body.name.trim() : '',
    channel: typeof body.channel === 'string' ? body.channel.trim() : '',
    budget: body.budget,
    spent: body.spent,
    clicks: body.clicks,
    conversions: body.conversions,
    revenue: body.revenue,
    status: body.status
  };

  if (!form.name) {
    errors.push('Название кампании обязательно.');
  } else if (form.name.length > MAX_NAME_LEN) {
    errors.push(`Название не длиннее ${MAX_NAME_LEN} символов.`);
  }

  if (!form.channel) {
    errors.push('Канал обязателен.');
  } else if (form.channel.length > MAX_CHANNEL_LEN) {
    errors.push(`Канал не длиннее ${MAX_CHANNEL_LEN} символов.`);
  } else if (!/^[a-zA-Zа-яА-ЯёЁ0-9_\-\s]+$/.test(form.channel)) {
    errors.push('Канал: допустимы буквы, цифры, пробел, дефис и подчёркивание.');
  }

  const budget = parseRequiredMoney(form.budget, 'Бюджет', errors);
  const spent = parseRequiredMoney(form.spent, 'Потрачено', errors);
  const revenue = parseRequiredMoney(form.revenue, 'Доход', errors);
  const clicks = parseRequiredInt(form.clicks, 'Клики', errors);
  const conversions = parseRequiredInt(form.conversions, 'Конверсии', errors);

  let status = typeof form.status === 'string' ? form.status.trim() : '';
  if (!status) {
    errors.push('Выберите статус.');
  } else if (!ALLOWED_STATUS.has(status)) {
    errors.push('Недопустимый статус кампании.');
  }

  if (budget !== null && spent !== null && spent > budget) {
    errors.push('Потрачено не может превышать бюджет.');
  }

  if (clicks !== null && conversions !== null && conversions > clicks) {
    errors.push('Конверсий не может быть больше, чем кликов.');
  }

  if (errors.length) {
    return { ok: false, errors, form };
  }

  return {
    ok: true,
    data: {
      name: form.name,
      channel: form.channel,
      budget,
      spent,
      clicks,
      conversions,
      revenue,
      status
    },
    form
  };
}

module.exports = { validateCampaignForm };
