// Pagine che passano da una Pages Function per applicare i blocchi claim (render lato server, lettura SOLO da D1).
//   blocchi: blocchi con una REGIONE marcata nel template (<!--claim:EC-XX--> ... <!--/claim:EC-XX-->). Se un marcatore atteso manca
//            il render FALLISCE (fail-closed): non si serve mai una pagina in cui il contenuto ORIGINALE statico potrebbe restare.
//   jsonld:  la pagina ha JSON-LD Product/MedicalDevice/offers, da omettere quando EC-03 non emette ORIGINALE.
// Regioni = scripts/claim-dm/seed-lib.mjs (REGIONI): le stesse servono a estrarre la versione ORIGINALE dallo snapshot live.
// EC-02 (richiami sparsi) ed EC-06 (meta/title per pagina) NON hanno ancora una regione: restano inerti (contenuto statico).
export const PAGINE = {
  '/': { blocchi: ['EC-01', 'EC-03', 'EC-05'], jsonld: true },
  '/bracciale-anziani-detraibile/': { blocchi: [], jsonld: true },
  '/come-funziona-bracciale-ecura/': { blocchi: [], jsonld: true },
  '/confronto-bracciali-anziani/': { blocchi: ['EC-04'], jsonld: true },
  '/guida-cadute-anziani/': { blocchi: [], jsonld: true },
  '/guida-dispositivi-medici-teleassistenza/': { blocchi: ['EC-12'], jsonld: true },
};
