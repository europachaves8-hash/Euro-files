// ============================================================
// ECUMAP.COM — Site Cloner (Scraper Completo)
//
// Captura tudo: HTML, CSS, screenshots, imagens, estrutura,
// textos, componentes, navegação — para reconstruir o site.
//
// SETUP:
//   cd ecumap-clone
//   npm init -y
//   npm install playwright
//   npx playwright install chromium
//   node scraper.js
// ============================================================

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// ---------- CONFIGURAÇÃO ----------
const BASE_URL = 'https://www.ecumap.com';
const LOGIN_URL = `${BASE_URL}/login`;
const EMAIL = 'joaovictordems@gmail.com';
const PASSWORD = '135879462jV';

const DIRS = {
  dados: './dados',
  screenshots: './screenshots',
  html: './html_raw',
  assets: './assets',
};

const TIMEOUT_MS = 30_000;
const HEADLESS = false;

// Páginas conhecidas para scraping (vai descobrir mais durante o processo)
const KNOWN_PAGES = [
  '/',
  '/login',
  '/vehicle-list',
  '/chiptuning-services',
  '/pricing',
  '/contact-us',
  '/register',
  '/faq',
  '/about',
  '/terms',
  '/privacy-policy',
  '/forgot-password',
];

// ---------- UTILITÁRIOS ----------
const delay = (min = 800, max = 2000) =>
  new Promise(r => setTimeout(r, Math.random() * (max - min) + min));

const save = (file, data) =>
  fs.writeFileSync(file, typeof data === 'string' ? data : JSON.stringify(data, null, 2), 'utf-8');

const slugify = (str) =>
  str.replace(/^\//, '').replace(/\//g, '_').replace(/[^a-zA-Z0-9_-]/g, '_') || 'home';

// Download de arquivo (imagem, CSS, etc)
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) return resolve(dest);

    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);

    protocol.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

// ---------- LOGIN (manual — pausa para o usuário fazer login no browser) ----------
async function doLogin(page) {
  console.log('\n[LOGIN] Abrindo página de login...');
  console.log('[LOGIN] ============================================');
  console.log('[LOGIN]  FAÇA O LOGIN MANUALMENTE NO BROWSER!');
  console.log('[LOGIN]  O script vai esperar você logar.');
  console.log('[LOGIN]  Depois do login, ele continua sozinho.');
  console.log('[LOGIN] ============================================\n');

  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Pré-preencher os campos para facilitar
  try {
    await delay(2000, 3000);
    const emailField = await page.$('input[name="email"], input[type="email"], #email');
    const passField = await page.$('input[name="password"], input[type="password"], #password');
    if (emailField) await emailField.fill(EMAIL);
    if (passField) await passField.fill(PASSWORD);
    console.log('[LOGIN] Campos pré-preenchidos. Só clique em LOGIN no browser!\n');
  } catch {
    console.log('[LOGIN] Preencha email e senha manualmente no browser.\n');
  }

  // Esperar até sair da página de login (máximo 5 minutos)
  const maxWait = 5 * 60 * 1000;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    await delay(2000, 3000);

    const currentUrl = page.url();
    const content = await page.content().catch(() => '');
    const contentLower = content.toLowerCase();

    // Verificar se logou (saiu do /login ou tem indicadores de logado)
    const isLoggedIn = (!currentUrl.includes('/login') && !currentUrl.includes('/register') && !currentUrl.includes('password')) ||
                       contentLower.includes('logout') ||
                       contentLower.includes('dashboard') ||
                       contentLower.includes('my account') ||
                       contentLower.includes('credit');

    if (isLoggedIn) {
      console.log('[LOGIN] Login detectado com sucesso!');
      console.log(`[LOGIN] URL atual: ${currentUrl}`);
      return true;
    }

    // Se deu 419, recarregar a página
    if (content.includes('PAGE EXPIRED') || content.includes('419')) {
      console.log('[LOGIN] Erro 419 detectado. Recarregando página de login...');
      await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await delay(2000, 3000);
      try {
        const emailField = await page.$('input[name="email"], input[type="email"], #email');
        const passField = await page.$('input[name="password"], input[type="password"], #password');
        if (emailField) await emailField.fill(EMAIL);
        if (passField) await passField.fill(PASSWORD);
        console.log('[LOGIN] Página recarregada. Tente clicar LOGIN novamente!\n');
      } catch {}
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    if (elapsed % 15 === 0) {
      console.log(`[LOGIN] Aguardando login... (${elapsed}s)`);
    }
  }

  console.log('[LOGIN] Timeout de 5 minutos. Continuando sem login...');
  return false;
}

// ---------- DESCOBRIR TODAS AS PÁGINAS ----------
async function discoverPages(page) {
  console.log('\n[DISCOVER] Buscando todas as páginas do site...');

  const allLinks = new Set(KNOWN_PAGES);

  // Navegar para home e coletar todos os links internos
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await delay(2000, 3000);

  const homeLinks = await page.$$eval('a[href]', (anchors, base) => {
    return anchors
      .map(a => {
        try {
          const url = new URL(a.href, base);
          if (url.origin === new URL(base).origin) {
            return url.pathname + url.search;
          }
        } catch {}
        return null;
      })
      .filter(Boolean);
  }, BASE_URL);

  homeLinks.forEach(l => allLinks.add(l.split('?')[0])); // sem query strings

  // Navegar para cada página conhecida e coletar mais links
  for (const knownPage of [...KNOWN_PAGES]) {
    try {
      await page.goto(`${BASE_URL}${knownPage}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await delay(1000, 2000);

      const pageLinks = await page.$$eval('a[href]', (anchors, base) => {
        return anchors
          .map(a => {
            try {
              const url = new URL(a.href, base);
              if (url.origin === new URL(base).origin) {
                return url.pathname;
              }
            } catch {}
            return null;
          })
          .filter(Boolean);
      }, BASE_URL);

      pageLinks.forEach(l => allLinks.add(l.split('?')[0]));
    } catch {}
  }

  // Filtrar links irrelevantes
  const filtered = [...allLinks].filter(link => {
    const lower = link.toLowerCase();
    return !lower.includes('/api/') &&
           !lower.includes('/wp-') &&
           !lower.endsWith('.pdf') &&
           !lower.endsWith('.zip') &&
           !lower.endsWith('.jpg') &&
           !lower.endsWith('.png') &&
           link.length < 200;
  });

  console.log(`[DISCOVER] ${filtered.length} páginas encontradas.`);
  return filtered;
}

// ---------- CAPTURAR PÁGINA COMPLETA ----------
async function scrapePage(page, pagePath) {
  const slug = slugify(pagePath);
  const url = `${BASE_URL}${pagePath}`;

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
    await delay(1500, 3000);

    // Scroll down para carregar lazy content
    await page.evaluate(async () => {
      await new Promise(resolve => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 100);
        // Timeout safety
        setTimeout(() => { clearInterval(timer); window.scrollTo(0, 0); resolve(); }, 10000);
      });
    });
    await delay(1000, 1500);

    // 1. Screenshot full page
    await page.screenshot({
      path: `${DIRS.screenshots}/${slug}.png`,
      fullPage: true,
    });

    // 2. HTML bruto
    const html = await page.content();
    save(`${DIRS.html}/${slug}.html`, html);

    // 3. Extrair dados estruturados da página
    const pageData = await page.evaluate(() => {
      // --- NAVEGAÇÃO / MENU ---
      const nav = [];
      document.querySelectorAll('nav a, header a, .navbar a, .menu a, .nav a').forEach(a => {
        nav.push({
          text: a.textContent.trim(),
          href: a.getAttribute('href'),
          classes: a.className,
        });
      });

      // --- META TAGS ---
      const meta = {};
      document.querySelectorAll('meta').forEach(m => {
        const name = m.getAttribute('name') || m.getAttribute('property') || '';
        const content = m.getAttribute('content') || '';
        if (name && content) meta[name] = content;
      });

      // --- TÍTULO ---
      const title = document.title;
      const h1 = document.querySelector('h1')?.textContent?.trim() || '';

      // --- HEADER ---
      const header = document.querySelector('header, .header, .navbar');
      const headerData = header ? {
        html: header.outerHTML,
        text: header.textContent.replace(/\s+/g, ' ').trim(),
        classes: header.className,
        logo: header.querySelector('img')?.src || '',
      } : null;

      // --- FOOTER ---
      const footer = document.querySelector('footer, .footer');
      const footerData = footer ? {
        html: footer.outerHTML,
        text: footer.textContent.replace(/\s+/g, ' ').trim(),
        classes: footer.className,
      } : null;

      // --- SEÇÕES / BLOCOS DA PÁGINA ---
      const sections = [];
      document.querySelectorAll('section, .section, main > div, .container > div, .content > div').forEach(sec => {
        const heading = sec.querySelector('h1, h2, h3, h4')?.textContent?.trim() || '';
        sections.push({
          tag: sec.tagName.toLowerCase(),
          id: sec.id,
          classes: sec.className,
          heading,
          text: sec.textContent.replace(/\s+/g, ' ').trim().substring(0, 2000),
          html: sec.outerHTML.substring(0, 5000),
          childCount: sec.children.length,
        });
      });

      // --- FORMULÁRIOS ---
      const forms = [];
      document.querySelectorAll('form').forEach(form => {
        const inputs = Array.from(form.querySelectorAll('input, select, textarea, button')).map(el => ({
          tag: el.tagName.toLowerCase(),
          type: el.type || '',
          name: el.name || '',
          id: el.id || '',
          placeholder: el.placeholder || '',
          classes: el.className,
          options: el.tagName === 'SELECT'
            ? Array.from(el.options).map(o => ({ value: o.value, text: o.textContent.trim() }))
            : undefined,
        }));
        forms.push({
          action: form.action,
          method: form.method,
          classes: form.className,
          id: form.id,
          inputs,
        });
      });

      // --- TABELAS ---
      const tables = [];
      document.querySelectorAll('table').forEach(table => {
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
        const rows = [];
        table.querySelectorAll('tbody tr, tr').forEach(tr => {
          const cells = Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim());
          if (cells.length > 0) rows.push(cells);
        });
        tables.push({ headers, rows, classes: table.className });
      });

      // --- CARDS / COMPONENTES ---
      const cards = [];
      document.querySelectorAll('.card, [class*="card"], [class*="box"], [class*="feature"], [class*="service"], [class*="plan"], [class*="pricing"]').forEach(el => {
        cards.push({
          classes: el.className,
          heading: el.querySelector('h2, h3, h4, h5, .title')?.textContent?.trim() || '',
          text: el.textContent.replace(/\s+/g, ' ').trim().substring(0, 500),
          html: el.outerHTML.substring(0, 3000),
          image: el.querySelector('img')?.src || '',
        });
      });

      // --- BOTÕES ---
      const buttons = [];
      document.querySelectorAll('button, .btn, a.btn, [class*="btn"], input[type="submit"]').forEach(btn => {
        buttons.push({
          text: btn.textContent.trim(),
          classes: btn.className,
          href: btn.getAttribute('href') || '',
          type: btn.type || '',
        });
      });

      // --- IMAGENS ---
      const images = [];
      document.querySelectorAll('img[src]').forEach(img => {
        images.push({
          src: img.src,
          alt: img.alt || '',
          classes: img.className,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        });
      });

      // --- LINKS INTERNOS ---
      const links = [];
      document.querySelectorAll('a[href]').forEach(a => {
        links.push({
          text: a.textContent.trim().substring(0, 100),
          href: a.getAttribute('href'),
          classes: a.className,
        });
      });

      // --- TEXTO PRINCIPAL ---
      const mainEl = document.querySelector('main, .main-content, .content, article') || document.body;
      const mainText = mainEl.textContent.replace(/\s+/g, ' ').trim().substring(0, 10000);

      return {
        title,
        h1,
        meta,
        navigation: nav,
        header: headerData,
        footer: footerData,
        sections,
        forms,
        tables,
        cards,
        buttons,
        images,
        links,
        mainText,
      };
    });

    // 4. Extrair CSS computado (cores, fontes, espaçamentos)
    const styles = await page.evaluate(() => {
      const body = document.body;
      const bodyStyle = getComputedStyle(body);

      // Coletar todas as cores e fontes usadas
      const colors = new Set();
      const fonts = new Set();
      const bgColors = new Set();

      document.querySelectorAll('*').forEach(el => {
        const s = getComputedStyle(el);
        if (s.color && s.color !== 'rgba(0, 0, 0, 0)') colors.add(s.color);
        if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') bgColors.add(s.backgroundColor);
        if (s.fontFamily) fonts.add(s.fontFamily.split(',')[0].trim().replace(/"/g, ''));
      });

      // Estilos de elementos-chave
      const getElStyle = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const s = getComputedStyle(el);
        return {
          color: s.color,
          backgroundColor: s.backgroundColor,
          fontSize: s.fontSize,
          fontFamily: s.fontFamily,
          fontWeight: s.fontWeight,
          padding: s.padding,
          margin: s.margin,
          borderRadius: s.borderRadius,
          boxShadow: s.boxShadow,
          lineHeight: s.lineHeight,
          letterSpacing: s.letterSpacing,
        };
      };

      // Coletar stylesheets inline e externas
      const stylesheetUrls = [];
      for (const sheet of document.styleSheets) {
        try {
          if (sheet.href) stylesheetUrls.push(sheet.href);
        } catch {}
      }

      // Variáveis CSS (custom properties)
      const cssVars = {};
      const rootStyle = getComputedStyle(document.documentElement);
      // Tentar pegar variáveis CSS comuns
      ['--primary', '--secondary', '--accent', '--bg', '--text', '--border',
       '--primary-color', '--secondary-color', '--font-family', '--font-size',
       '--color-primary', '--color-secondary', '--color-bg'].forEach(v => {
        const val = rootStyle.getPropertyValue(v).trim();
        if (val) cssVars[v] = val;
      });

      return {
        bodyStyle: {
          backgroundColor: bodyStyle.backgroundColor,
          color: bodyStyle.color,
          fontFamily: bodyStyle.fontFamily,
          fontSize: bodyStyle.fontSize,
          lineHeight: bodyStyle.lineHeight,
        },
        colors: [...colors].slice(0, 30),
        bgColors: [...bgColors].slice(0, 30),
        fonts: [...fonts],
        cssVars,
        stylesheetUrls,
        elements: {
          h1: getElStyle('h1'),
          h2: getElStyle('h2'),
          h3: getElStyle('h3'),
          p: getElStyle('p'),
          a: getElStyle('a'),
          button: getElStyle('button, .btn'),
          header: getElStyle('header'),
          footer: getElStyle('footer'),
          nav: getElStyle('nav'),
          input: getElStyle('input'),
          select: getElStyle('select'),
          table: getElStyle('table'),
          card: getElStyle('.card, [class*="card"]'),
        },
      };
    });

    return {
      path: pagePath,
      url,
      slug,
      ...pageData,
      styles,
    };
  } catch (err) {
    console.error(`  [ERRO] ${pagePath}: ${err.message}`);
    return null;
  }
}

// ---------- BAIXAR ASSETS (imagens, logos, ícones) ----------
async function downloadAssets(allPageData) {
  console.log('\n[ASSETS] Baixando imagens e assets...');

  const downloaded = new Set();
  let count = 0;

  for (const pageData of allPageData) {
    if (!pageData || !pageData.images) continue;

    for (const img of pageData.images) {
      if (!img.src || downloaded.has(img.src)) continue;
      if (img.src.startsWith('data:')) continue; // skip base64

      try {
        const urlObj = new URL(img.src);
        const ext = path.extname(urlObj.pathname) || '.png';
        const filename = slugify(urlObj.pathname) + ext;
        const dest = `${DIRS.assets}/${filename}`;

        await downloadFile(img.src, dest);
        downloaded.add(img.src);
        count++;
      } catch {}
    }

    // Baixar logo do header
    if (pageData.header?.logo && !downloaded.has(pageData.header.logo)) {
      try {
        const urlObj = new URL(pageData.header.logo);
        const ext = path.extname(urlObj.pathname) || '.png';
        await downloadFile(pageData.header.logo, `${DIRS.assets}/logo${ext}`);
        downloaded.add(pageData.header.logo);
        count++;
      } catch {}
    }
  }

  // Baixar CSS externas
  const cssUrls = new Set();
  for (const pd of allPageData) {
    if (pd?.styles?.stylesheetUrls) {
      pd.styles.stylesheetUrls.forEach(u => cssUrls.add(u));
    }
  }

  let cssCount = 0;
  for (const cssUrl of cssUrls) {
    try {
      const filename = `style_${cssCount++}.css`;
      await downloadFile(cssUrl, `${DIRS.assets}/${filename}`);
    } catch {}
  }

  console.log(`[ASSETS] ${count} imagens + ${cssCount} CSS baixados.`);
}

// ============================================================
// SCRIPT PRINCIPAL
// ============================================================
(async () => {
  console.log('='.repeat(60));
  console.log('  ECUMAP.COM — Site Cloner');
  console.log('  Captura completa para reconstrução');
  console.log('='.repeat(60));

  const browser = await chromium.launch({
    headless: HEADLESS,
    channel: 'chrome',
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT_MS);

  try {
    // ===== FASE 1: LOGIN =====
    await doLogin(page);

    // Screenshot pós-login (dashboard/home logado)
    await page.screenshot({ path: `${DIRS.screenshots}/pos_login.png`, fullPage: true });

    // ===== FASE 2: DESCOBRIR PÁGINAS =====
    const pages = await discoverPages(page);
    save(`${DIRS.dados}/pages_discovered.json`, pages);

    // ===== FASE 3: SCRAPING DE CADA PÁGINA =====
    console.log(`\n[SCRAPING] Capturando ${pages.length} páginas...\n`);

    const allPageData = [];
    let processed = 0;

    for (const pagePath of pages) {
      console.log(`[${++processed}/${pages.length}] ${pagePath}`);

      const data = await scrapePage(page, pagePath);
      if (data) {
        allPageData.push(data);

        // Salvar progressivamente
        if (processed % 5 === 0) {
          save(`${DIRS.dados}/pages.json`, allPageData);
          console.log(`  [SAVE] ${allPageData.length} páginas salvas.`);
        }
      }
    }

    // Salvar tudo
    save(`${DIRS.dados}/pages.json`, allPageData);

    // ===== FASE 4: EXTRAIR COMPONENTES GLOBAIS =====
    console.log('\n[COMPONENTS] Extraindo componentes globais...');

    // Pegar header e footer da home (são globais)
    const homePage = allPageData.find(p => p.path === '/' || p.path === '');
    const components = {
      header: homePage?.header || allPageData[0]?.header || null,
      footer: homePage?.footer || allPageData[0]?.footer || null,
      navigation: homePage?.navigation || allPageData[0]?.navigation || [],
    };
    save(`${DIRS.dados}/components.json`, components);

    // ===== FASE 5: CONSOLIDAR ESTILOS =====
    console.log('[STYLES] Consolidando estilos...');

    const allColors = new Set();
    const allFonts = new Set();
    const allBgColors = new Set();

    for (const pd of allPageData) {
      if (pd?.styles) {
        pd.styles.colors?.forEach(c => allColors.add(c));
        pd.styles.bgColors?.forEach(c => allBgColors.add(c));
        pd.styles.fonts?.forEach(f => allFonts.add(f));
      }
    }

    const globalStyles = {
      colors: [...allColors],
      bgColors: [...allBgColors],
      fonts: [...allFonts],
      bodyStyle: homePage?.styles?.bodyStyle || allPageData[0]?.styles?.bodyStyle || {},
      cssVars: homePage?.styles?.cssVars || {},
      elements: homePage?.styles?.elements || {},
      stylesheetUrls: [...new Set(allPageData.flatMap(p => p?.styles?.stylesheetUrls || []))],
    };
    save(`${DIRS.dados}/styles.json`, globalStyles);

    // ===== FASE 6: BAIXAR ASSETS =====
    await downloadAssets(allPageData);

    // ===== FASE 7: MAPA DO SITE =====
    console.log('[SITEMAP] Gerando mapa do site...');

    const sitemap = allPageData.map(p => ({
      path: p.path,
      title: p.title,
      h1: p.h1,
      sections: p.sections?.length || 0,
      forms: p.forms?.length || 0,
      tables: p.tables?.length || 0,
      cards: p.cards?.length || 0,
      images: p.images?.length || 0,
    }));
    save(`${DIRS.dados}/sitemap.json`, sitemap);

    // ===== RESUMO FINAL =====
    console.log('\n' + '='.repeat(60));
    console.log('  SCRAPING COMPLETO!');
    console.log('='.repeat(60));
    console.log(`  Páginas capturadas: ${allPageData.length}`);
    console.log(`  Screenshots: ${DIRS.screenshots}/`);
    console.log(`  HTML bruto: ${DIRS.html}/`);
    console.log(`  Assets: ${DIRS.assets}/`);
    console.log(`  Dados estruturados: ${DIRS.dados}/`);
    console.log('');
    console.log('  Arquivos de dados:');
    console.log('    - pages.json         (tudo de cada página)');
    console.log('    - components.json    (header, footer, nav)');
    console.log('    - styles.json        (cores, fontes, CSS)');
    console.log('    - sitemap.json       (mapa do site)');
    console.log('='.repeat(60));

  } catch (err) {
    console.error(`\n[FATAL] ${err.message}`);
    console.error(err.stack);
  } finally {
    await browser.close();
    console.log('\n[FIM] Browser encerrado.');
  }
})();
