# Trust and Legal Checklist

The production storefront currently provides the catalog, cart and WhatsApp handoff. Account, checkout and order
pages are development-only previews: they do not create orders, reserve stock, clear the real cart or process cards.
Production purchases continue to be confirmed through authorized channels until the real backend flows are verified.

Legal pages are published in Frappe Wiki. The storefront does not maintain a local fallback copy of their content.

## Frappe Wiki

Las paginas legales se leen desde el endpoint publico:

```txt
GET https://erp.gruporeal.org/api/method/wiki.frappe_wiki.doctype.wiki_document.wiki_document.get_page_data?route={route}
```

Cada documento debe estar publicado y no privado:

```txt
message.doc.is_published = 1
message.doc.is_private = 0
```

Rutas requeridas para Clothing Center:

```txt
clothing-center/terminos-y-condiciones
clothing-center/politica-de-privacidad
clothing-center/cookies
clothing-center/envios
clothing-center/cambios-y-devoluciones
clothing-center/pagos
clothing-center/compra-segura
clothing-center/contacto
```

Rutas requeridas para ForTech:

```txt
fortech/terminos-y-condiciones
fortech/politica-de-privacidad
fortech/cookies
fortech/envios
fortech/cambios-y-devoluciones
fortech/pagos
fortech/compra-segura
fortech/contacto
```

Verificacion por documento:

```sh
curl -s -o /tmp/wiki-check.json -w '%{http_code}' 'https://erp.gruporeal.org/api/method/wiki.frappe_wiki.doctype.wiki_document.wiki_document.get_page_data?route=clothing-center%2Fterminos-y-condiciones'
```

## Auditor local

Antes de desplegar o mandar apelacion, correr:

```sh
npm run build
npm run audit:trust
```

El auditor valida que no exista fallback legal local, headers, archivos publicos, Consent Mode, sanitizacion del contenido Wiki y enlaces visibles de confianza.

Despues de desplegar, correr contra el dominio real:

```sh
npm run audit:trust:live
```

Para revisar otro dominio o un preview:

```sh
npm run audit:trust:live -- --url https://example.com
```

El auditor live valida headers publicados, rutas legales publicas, robots, sitemap, security.txt y estado de los endpoints Wiki.

## Consentimiento

- Consent Mode inicia en denied para `ad_storage`, `analytics_storage`, `ad_user_data` y `ad_personalization`.
- Google Analytics carga con consentimiento denegado por defecto.
- El banner permite aceptar o rechazar analiticas.
- `localStorage` de Mi seleccion es necesario para la funcion del catalogo, no analitico.

## Archivos publicos

Verificar despues del deploy:

```sh
curl -I https://clothingcenterni.com/robots.txt
curl -I https://clothingcenterni.com/sitemap-clothing.xml
curl -I https://clothingcenterni.com/.well-known/security.txt
```

## Headers

Verificar en Azure despues del deploy:

```sh
curl -I https://clothingcenterni.com/
```

Headers esperados:

```txt
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy
X-Frame-Options: DENY
Cross-Origin-Opener-Policy: same-origin-allow-popups
X-Permitted-Cross-Domain-Policies: none
```

## Revision para Meta / Instagram

- Footer visible con terminos, privacidad, cookies, envios, cambios, pagos, compra segura y contacto.
- Contacto consistente: correo, WhatsApp, direccion, Google Maps e Instagram/Facebook oficiales.
- Las politicas aclaran que la web es catalogo, no checkout.
- Precios y disponibilidad se muestran en tiempo real, pero la compra se confirma fuera de la web.
- Links de pago, si existen, se generan manualmente por canales autorizados.
- Politica de cambios: 7 dias calendarios, talla o estilo segun disponibilidad, excepciones de prendas claras y bodysuits por higiene, prenda nueva con etiquetas, sin cambios sobre cambios, tienda o delivery, delivery por cuenta del cliente.
