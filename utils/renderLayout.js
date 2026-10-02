const path = require('path');
const ejs = require('ejs');

const viewsPath = path.join(__dirname, '..', 'views');

function renderWithLayout(res, pageView, data = {}) {
  const pagePath = path.join(viewsPath, `${pageView}.ejs`);
  ejs.renderFile(pagePath, data, (err, body) => {
    if (err) {
      return res.status(500).render('500', { error: err, title: '500' });
    }
    res.render('layout', {
      ...data,
      user: data.user || res.locals.user || { name: 'Гость' },
      body,
      title: data.title || 'Аналитика рекламных кампаний'
    });
  });
}

module.exports = { renderWithLayout };
