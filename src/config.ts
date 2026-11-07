import sgc from "../assets/logo-sgc.png";
import ngnc from "../assets/ngnc-logo.png";
import acar from "../assets/logo-acaramerica.jpeg";

export const owner = {
  name: "Marcos Lopez",
  brand: "Dere Prime",
  // Solo direcciones confirmadas como contacto público. Vacío oculta los enlaces.
  email: "dere.prime@gmail.com",
  github: "https://github.com/dere-prime",
  discordId: "1392025706510286869",
  // Dato pendiente: describir la práctica real de conservación en ambos idiomas.
  inquiryRetention: { es: "", en: "" },
};

export const projects = [
  {
    name: "Santy's General Construction",
    image: sgc,
    url: "https://www.santysgeneralconstruction.com/",
    tone: "gold",
    field: { es: "Construcción", en: "Construction" },
  },
  {
    name: "NiGalletasNiChocolates Marketing Agency",
    image: ngnc,
    url: "https://nigalletasnichocolates.com/",
    tone: "wine",
    field: { es: "Agencia de marketing", en: "Marketing agency" },
  },
  {
    name: "A Car America",
    image: acar,
    url: "https://head.a-car-america-llc.pages.dev/",
    tone: "red",
    field: { es: "Automoción", en: "Automotive" },
    temporary: true,
  },
];

export type Lang = "es" | "en";
export const base = import.meta.env.BASE_URL.replace(/\/$/, "");
export const path = (route = "") => `${base}/${route.replace(/^\//, "")}`;
export const home = (lang: Lang) => path(lang === "es" ? "" : "en/");
export const legalSlugs = {
  legal: { es: "aviso-legal", en: "legal-notice" },
  privacy: { es: "privacidad", en: "privacy" },
  cookies: { es: "cookies", en: "cookies" },
} as const;
export type LegalKind = keyof typeof legalSlugs;
export const legalPath = (lang: Lang, kind: LegalKind) =>
  path(`${lang === "en" ? "en/" : ""}${legalSlugs[kind][lang]}/`);
export const canContact = Boolean(owner.email);
export const discordProfile = `https://discord.com/users/${owner.discordId}`;
