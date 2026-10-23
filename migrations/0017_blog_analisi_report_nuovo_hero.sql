-- Sostituisce l'hero dell'articolo "Analisi e report Premium": la foto precedente
-- era identica a quella della guida sui bracciali cadute.
UPDATE blog_articles
SET hero_image = 'https://www.ecura.it/img/blog/analisi-report-famiglia.jpg',
    hero_image_alt = 'Figlia e madre anziana sul divano guardano sullo smartphone il report di salute del servizio eCura Premium, con il bracciale al polso',
    content = replace(content,
      'Il dispositivo del servizio Premium: un orologio normale al polso, che misura e protegge mentre la vita continua come sempre.',
      'Il report di salute del servizio Premium, consultabile dai familiari direttamente dallo smartphone.'),
    date_modified = '2026-10-23'
WHERE slug = 'analisi-report-servizio-premium';
