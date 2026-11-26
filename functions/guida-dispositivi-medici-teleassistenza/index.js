// Pagina con blocchi claim (Claim DM). Render spento di default (CLAIM_RENDER_ATTIVO): asset statico, senza dipendenze da D1.
import { servePagina } from '../_lib/claim-render.js';
export const onRequest = (context) => servePagina(context, '/guida-dispositivi-medici-teleassistenza/');
