-- Ahrefs: "link a URL 404" su /blog/bonus-agevolazioni-anziani-2026/ -> /cdn-cgi/l/email-protection
-- Cloudflare Email Address Obfuscation riscrive il mailto in un link /cdn-cgi/l/email-protection (404 per i crawler).
-- Soluzione: racchiudere l'indirizzo in <!--email_off--> ... <!--/email_off--> (come gia' fatto in home).
UPDATE blog_articles
SET content = replace(content,
      '<a href="mailto:info@ecura.it">info@ecura.it</a>',
      '<!--email_off--><a href="mailto:info@ecura.it">info@ecura.it</a><!--/email_off-->'),
    updated_at = datetime('now')
WHERE slug = 'bonus-agevolazioni-anziani-2026'
  AND instr(content, '<a href="mailto:info@ecura.it">info@ecura.it</a>') > 0
  AND instr(content, '<!--email_off-->') = 0;
