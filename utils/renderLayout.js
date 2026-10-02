const path = require('path');
const ejs = require('ejs');

const viewsPath = path.join(__dirname, '..', 'views');

function renderWithLayout(res, pageView, data = {}) {
  const pagePath = path.join(viewsPath, `${pageView}.ejs`);
  const viewData = { ...res.locals, ...data };
  ejs.renderFile(pagePath, viewData, (err, body) => {
    if (err) {
      return res.status(500).render('500', { error: err, title: '500' });
    }
    res.render('layout', {
      ...viewData,
      user: viewData.user || res.locals.user || { name: 'Гость', authenticated: false },
      body,
      title: viewData.title || 'Аналитика рекламных кампаний'
    });
  });
}

module.exports = { renderWithLayout };
