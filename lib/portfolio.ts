export const profile = {
  name: "Marcos Lopez",
  handle: "Dere Prime",
  user: "dere_prime",
  host: "sa-mp",
  birth: "2008-09-06",
  location: "Latinoamérica",
  role: "Programador de servidores SA-MP",
  tagline: "Senior en SA-MP (Pawn) · Junior en JS · TS · React · C#",
}

export type Skill = {
  name: string
  level: "senior" | "junior"
  percent: number
}

export const skills: Skill[] = [
  { name: "SA-MP / Pawn", level: "senior", percent: 92 },
  { name: "JavaScript", level: "junior", percent: 62 },
  { name: "TypeScript", level: "junior", percent: 55 },
  { name: "React", level: "junior", percent: 58 },
  { name: "C#", level: "junior", percent: 50 },
]

export type Project = {
  name: string
  stack: string
  desc: string
}

export const projects: Project[] = [
  {
    name: "roleplay-gamemode",
    stack: "Pawn · MySQL",
    desc: "Gamemode de rol para SA-MP con sistema de facciones, economía y persistencia en MySQL.",
  },
  {
    name: "anticheat-core",
    stack: "Pawn",
    desc: "Módulo anticheat con detección de money-hacks, teleport y speed-hack en tiempo real.",
  },
  {
    name: "samp-admin-panel",
    stack: "React · TS · C#",
    desc: "Panel web para administrar el servidor SA-MP: bans, logs y estadísticas en vivo.",
  },
  {
    name: "launcher-net",
    stack: "C# · .NET",
    desc: "Launcher de escritorio que conecta jugadores al servidor y gestiona actualizaciones.",
  },
]

export const socials: { label: string; value: string; url: string }[] = [
  { label: "GitHub", value: "github.com/dere-prime", url: "https://github.com" },
  { label: "Discord", value: "dere_prime", url: "#" },
  { label: "Email", value: "dere.prime@mail.com", url: "mailto:dere.prime@mail.com" },
]

export function getAge(birth: string): number {
  const b = new Date(birth)
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}
