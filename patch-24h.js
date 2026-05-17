const fs = require('fs');

const fixes = {
  en: {
    hero: 'Get your price instantly, 100% online.',
    heroNew: 'Get a personalised response within 24h, 100% online.',
    s3: 'the price displays instantly.',
    s3New: 'our team responds within 24h.',
  },
  de: {
    hero: 'Erhalten Sie Ihren Preis sofort, 100% online.',
    heroNew: 'Erhalten Sie eine persönliche Antwort innerhalb von 24h, 100% online.',
    s3: 'der Preis wird sofort angezeigt.',
    s3New: 'unser Team antwortet innerhalb von 24h.',
  },
  es: {
    hero: 'Obtén tu precio al instante, 100% online.',
    heroNew: 'Obtén una respuesta personalizada en 24h, 100% online.',
    s3: 'el precio aparece al instante.',
    s3New: 'nuestro equipo te responde en 24h.',
  },
  pt: {
    hero: 'Obtém o teu preço imediatamente, 100% online.',
    heroNew: 'Obtém uma resposta personalizada em 24h, 100% online.',
    s3: 'o preço aparece instantaneamente.',
    s3New: 'a nossa equipa responde em 24h.',
  },
  nl: {
    hero: 'Krijg direct uw prijs, 100% online.',
    heroNew: 'Ontvang een persoonlijk antwoord binnen 24u, 100% online.',
    s3: 'de prijs wordt direct weergegeven.',
    s3New: 'ons team antwoordt binnen 24u.',
  },
  pl: {
    hero: 'Uzyskaj swoją cenę natychmiast, 100% online.',
    heroNew: 'Uzyskaj spersonalizowaną odpowiedź w ciągu 24h, 100% online.',
    s3: 'cena wyświetla się natychmiast.',
    s3New: 'nasz zespół odpowiada w ciągu 24h.',
  },
};

for (const [lang, c] of Object.entries(fixes)) {
  let content = fs.readFileSync('messages/' + lang + '.json', 'utf8');
  content = content.replace(c.hero, c.heroNew);
  content = content.replace(c.s3, c.s3New);
  fs.writeFileSync('messages/' + lang + '.json', content);
  console.log('✅', lang);
}
