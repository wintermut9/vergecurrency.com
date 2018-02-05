const express = require('express')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const i18nextMiddleware = require('i18next-express-middleware');
const Backend = require('i18next-node-fs-backend');
const i18n = require('./i18n');

// const store = {
//   initialized: false,
//   showLoader: true,
//   url: null,
// };

// const routes = [
//   ['/', '/index'],
//   ['/home', '/home'],
//   ['/about', '/about'],
//   ['/blog', '/blog'],
//   ['/post', '/post'],
//   ['/presskit', '/presskit'],
//   ['/pressreleases', '/pressreleases'],
//   ['/press-releases', '/pressreleases']
// ];

// const withStore = routes.map(([ endpoint, page ]) => endpoint);

// const initializer = (req, res, next) => {
//   if (store.url === req.url) store.showLoader = true;
//   else if (withStore.includes(req.url)) {
//     store.url = req.url;

//     if (store.initialized) store.showLoader = false;
//     else store.initialized = true;
//   }

//   next();
// }

// init i18next with serverside settings
// using i18next-express-middleware
i18n
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    preload: ['en', 'de', 'nl', 'jp'],

    // need to preload all the namespaces
    // add more namespaces as pages are created
    ns: ['common', 'header', 'footer', 'home', 'presskit', 'pressreleases'],
    backend: {
      loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json',
      addPath: __dirname + '/locales/{{lng}}/{{ns}}.missing.json'
    }
  }, () => {
    // loaded translations we can bootstrap our routes
    app.prepare()
      .then(() => {
        const server = express()

        server.use(initializer);

        // routes.forEach(([ endpoint, page ]) => {
        //   server.get(endpoint, (req, res) => app.render(req, res, page, { store }));
        // });

        // enable middleware for i18next
        server.use(i18nextMiddleware.handle(i18n));

        // serve locales for client
        server.use('/locales', express.static(__dirname + '/locales'))

        // missing keys
        server.post('/locales/add/:lng/:ns', i18nextMiddleware.missingKeyHandler(i18n));

        // use next.js
        server.get('*', (req, res) => handle(req, res))

        server.listen(3000, (err) => {
          if (err) throw err
          console.log('> Ready on http://localhost:3000')
        })
      })
  });
