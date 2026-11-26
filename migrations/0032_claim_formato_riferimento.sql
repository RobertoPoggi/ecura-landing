-- Claim DM: formato del riferimento all'autorizzazione (testo fornito dal committente il 22/11/2026).
-- Valore di CONFIGURAZIONE (modificabile): non e' scritto nel codice. Viene emesso solo con numero_provvedimento E data_autorizzazione
-- compilati (data in formato gg/mm/aaaa). Non sovrascrive un valore gia' impostato a mano.
UPDATE claim_config
   SET valore = 'Autorizzato dal Ministero della Salute con provvedimento n. {numero_provvedimento} del {data_autorizzazione}',
       updated_at = datetime('now')
 WHERE chiave = 'formato_riferimento_autorizzazione' AND (valore IS NULL OR trim(valore) = '');
