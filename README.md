# Dere Prime

Portafolio de Marcos Lopez: desarrollo web y sistemas para servidores de juego desde República Dominicana.

Sitio estático con Astro, TypeScript y CSS. Español en `/` e inglés en `/en/`.

## Geometría de la interfaz

La interfaz adapta a la web el uso de cápsulas y esquinas concéntricas descrito por [Apple en WWDC25](https://developer.apple.com/videos/play/wwdc2025/356/). Los radios se centralizan en `src/styles/global.css`: controles compactos de 14 px, tarjetas de 28 px y paneles de 36 px. Estos valores son decisiones del sitio, no medidas universales oficiales de Apple. Las cápsulas toman un radio equivalente a la mitad de su dimensión menor; las esquinas de imágenes dentro de tarjetas descuentan el borde exterior.

Los controles principales tienen un área mínima de 44 × 44 píxeles CSS, como adaptación web de la recomendación de [tamaño de controles de Apple](https://developer.apple.com/design/human-interface-guidelines/accessibility). Los navegadores compatibles añaden `corner-shape: squircle` a los paneles; el resto mantiene esquinas redondeadas mediante `border-radius`. El emblema y los logos conservan su forma original.

El fondo y el marco del emblema en portada siguen el contorno de la D, con cortes diagonales a la derecha. La ilustración original se conserva completa dentro de esa silueta.

## Desarrollo

Requisitos: Node.js 24 LTS y npm. En PowerShell, utiliza `npm.cmd` si la política de ejecución impide ejecutar `npm`.

```powershell
npm.cmd ci
npm.cmd run dev
```

Compilación y vista previa de producción:

```powershell
npm.cmd run build
npm.cmd run preview
```

## Publicar en GitHub Pages

El repositorio es [dere-prime/dere-prime.github.io](https://github.com/dere-prime/dere-prime.github.io). La dirección del portafolio es **https://dere-prime.github.io/**.

1. En GitHub, abre **Settings → Pages** del repositorio.
2. En **Build and deployment → Source**, selecciona **GitHub Actions**.
3. Desde la carpeta del proyecto, guarda y sube los cambios:

   ```powershell
   git add .
   git commit -m "Publicar portafolio Dere Prime"
   git push origin master
   ```

4. Abre la pestaña **Actions** y espera a que **Deploy portfolio to GitHub Pages** termine correctamente.
5. Visita **https://dere-prime.github.io/**. Las siguientes publicaciones se realizan al subir cambios a `master` o `main`.

El workflow está en `.github/workflows/pages.yml`: instala dependencias con `npm ci`, comprueba tipos, compila, verifica el resultado y despliega `dist/`. También se puede ejecutar desde **Actions → Deploy portfolio to GitHub Pages → Run workflow**.

No es necesario subir `node_modules/`, `dist/`, `.astro/` ni `qa-output/`; están excluidos de Git.

Referencia: [configurar la publicación con GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow).

## Contenido y configuración

| Archivo                        | Contenido                                                 |
| ------------------------------ | --------------------------------------------------------- |
| `src/config.ts`                | Proyectos, correo, GitHub e ID de Discord                 |
| `src/content.ts`               | Textos en español e inglés                                |
| `src/components/Home.astro`    | Secciones de la portada                                   |
| `src/components/Legal.astro`   | Aviso legal, privacidad y cookies                         |
| `src/styles/global.css`        | Diseño, cuadrícula, adaptación a pantallas y animaciones  |
| `src/scripts/site.ts`          | Menú, idioma, navegación y entradas al recorrer la página |
| `src/scripts/smooth-scroll.ts` | Interpolación del desplazamiento con Lenis                |
| `assets/`                      | Emblema y logos de los proyectos                          |

El correo de trabajo es `dere.prime@gmail.com`. Discord utiliza el perfil `https://discord.com/users/1392025706510286869` y GitHub `https://github.com/dere-prime`.

Para cambiar el dominio de A Car America, modifica su URL en `projects` dentro de `src/config.ts` y retira `temporary: true` cuando deje de ser una vista previa.

`owner.inquiryRetention.es` y `.en` permiten documentar el criterio de conservación de consultas. Están pendientes de definición; no se publica un plazo sin confirmar. La privacidad describe los canales de contacto, los proveedores y el ejercicio de derechos.

## Dominio y prefijo de rutas

El workflow obtiene automáticamente el origen y la ruta de la configuración de GitHub Pages. Para compilar localmente con otro destino:

```powershell
$env:SITE_URL = 'https://usuario.github.io'
$env:BASE_PATH = '/repositorio/'
npm.cmd run build
npm.cmd run verify
npm.cmd run preview
```

`SITE_URL` debe contener el origen, sin el prefijo del repositorio. `BASE_PATH` contiene ese prefijo; para publicar en raíz, usa `/`.

Para un dominio propio, configura el dominio y el DNS en **Settings → Pages** y activa HTTPS. En compilaciones locales, usa ese origen como `SITE_URL` y `/` como `BASE_PATH`. Si necesitas un archivo `CNAME`, colócalo en `public/CNAME`.

## Comprobaciones

```powershell
npm.cmd run check
npm.cmd run verify:all
```

`verify:all` compila y verifica el sitio servido en raíz y bajo `/portfolio/`. Comprueba páginas, anclas, recursos, metadatos, proyectos, contactos, menú, idiomas, animaciones e interpolación. El segundo build se guarda en `qa-output/prefix/`. Para verificar solo el build actual de `dist/`, usa `npm.cmd run verify`.

Las pruebas de DOM no sustituyen la revisión en navegador. Antes de publicar, revisa escritorio, móvil a 360 px, navegación por teclado, enlaces externos y desplazamiento en teléfono.

## Privacidad y licencias

El sitio sirve fuentes e imágenes localmente. No incorpora analítica, publicidad, formularios, pagos, cookies propias, almacenamiento local ni embeds. GitHub Pages gestiona sus propios registros de seguridad, descritos en la página de privacidad.

Las marcas y obras de los proyectos pertenecen a sus respectivos titulares. Sus permisos de uso deben corresponder a la presentación en el portafolio.

- Manrope: [licencia OFL](public/licenses/manrope-OFL.txt).
- Lenis: [licencia MIT](public/licenses/lenis-MIT.txt).
