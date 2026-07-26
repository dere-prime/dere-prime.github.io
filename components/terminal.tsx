"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { profile, skills, projects, socials, getAge } from "@/lib/portfolio"

type Line = { id: number; node: React.ReactNode }

const PROMPT_USER = `${profile.user}@${profile.host}`

function Prompt({ path = "~" }: { path?: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-accent">{PROMPT_USER}</span>
      <span className="text-muted-foreground">:</span>
      <span className="text-primary/70">{path}</span>
      <span className="text-muted-foreground">$ </span>
    </span>
  )
}

function Bar({ percent }: { percent: number }) {
  const total = 20
  const filled = Math.round((percent / 100) * total)
  return (
    <span className="text-primary">
      [{"█".repeat(filled)}
      <span className="text-muted-foreground">{"░".repeat(total - filled)}</span>] {percent}%
    </span>
  )
}

const HELP_ITEMS: { cmd: string; desc: string }[] = [
  { cmd: "help", desc: "muestra los comandos disponibles" },
  { cmd: "whoami", desc: "información sobre mí" },
  { cmd: "skills", desc: "lenguajes y niveles" },
  { cmd: "projects", desc: "proyectos destacados" },
  { cmd: "samp", desc: "mi experiencia en SA-MP" },
  { cmd: "contact", desc: "cómo contactarme" },
  { cmd: "neofetch", desc: "resumen del sistema" },
  { cmd: "social", desc: "redes y enlaces" },
  { cmd: "date", desc: "fecha y hora actual" },
  { cmd: "clear", desc: "limpia la terminal" },
]

export function Terminal() {
  const [history, setHistory] = useState<Line[]>([])
  const [input, setInput] = useState("")
  const [cmdLog, setCmdLog] = useState<string[]>([])
  const [logIndex, setLogIndex] = useState<number>(-1)
  const idRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const nextId = () => ++idRef.current

  const push = useCallback((node: React.ReactNode) => {
    setHistory((h) => [...h, { id: idRef.current++, node }])
  }, [])

  const commands = useMemo<Record<string, () => React.ReactNode>>(() => {
    return {
      help: () => (
        <div className="space-y-0.5">
          <p className="text-muted-foreground">Comandos disponibles:</p>
          {HELP_ITEMS.map((i) => (
            <p key={i.cmd}>
              <span className="text-accent inline-block w-24">{i.cmd}</span>
              <span className="text-muted-foreground">{i.desc}</span>
            </p>
          ))}
          <p className="pt-1 text-muted-foreground">
            Tip: usa <span className="text-primary">Tab</span> para autocompletar y{" "}
            <span className="text-primary">↑/↓</span> para navegar el historial.
          </p>
        </div>
      ),
      whoami: () => (
        <div className="space-y-1">
          <p>
            <span className="text-accent">Nombre:</span> {profile.name}{" "}
            <span className="text-muted-foreground">(alias &quot;{profile.handle}&quot;)</span>
          </p>
          <p>
            <span className="text-accent">Edad:</span> {getAge(profile.birth)} años{" "}
            <span className="text-muted-foreground">· nac. 6 sep 2008</span>
          </p>
          <p>
            <span className="text-accent">Rol:</span> {profile.role}
          </p>
          <p className="text-muted-foreground max-w-xl text-pretty">
            Programador enfocado en el desarrollo de servidores de SA-MP (San Andreas Multiplayer) en
            Pawn, ampliando conocimientos hacia el desarrollo web y de escritorio.
          </p>
        </div>
      ),
      skills: () => (
        <div className="space-y-1">
          {skills.map((s) => (
            <p key={s.name} className="flex flex-wrap items-center gap-x-2">
              <span className="inline-block w-32 text-foreground">{s.name}</span>
              <Bar percent={s.percent} />
              <span
                className={
                  s.level === "senior"
                    ? "text-accent uppercase text-xs"
                    : "text-muted-foreground uppercase text-xs"
                }
              >
                {s.level}
              </span>
            </p>
          ))}
        </div>
      ),
      samp: () => (
        <div className="space-y-1 max-w-xl">
          <p className="text-accent">// SA-MP — San Andreas Multiplayer</p>
          <p className="text-muted-foreground text-pretty">
            Nivel <span className="text-primary">SENIOR</span>. Desarrollo gamemodes y filterscripts en
            Pawn: sistemas de rol, economía, facciones, anticheat y persistencia con MySQL.
          </p>
          <p className="text-muted-foreground">
            Experiencia con: <span className="text-foreground">Pawn</span>,{" "}
            <span className="text-foreground">MySQL</span>,{" "}
            <span className="text-foreground">streamer plugin</span>,{" "}
            <span className="text-foreground">sscanf</span>,{" "}
            <span className="text-foreground">YSI</span>.
          </p>
        </div>
      ),
      projects: () => (
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.name}>
              <p>
                <span className="text-accent">➜ {p.name}</span>{" "}
                <span className="text-muted-foreground text-xs">[{p.stack}]</span>
              </p>
              <p className="text-muted-foreground pl-4 text-pretty max-w-xl">{p.desc}</p>
            </div>
          ))}
        </div>
      ),
      contact: () => (
        <div className="space-y-1">
          <p className="text-muted-foreground">Puedes encontrarme en:</p>
          {socials.map((s) => (
            <p key={s.label}>
              <span className="text-accent inline-block w-20">{s.label}</span>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-2 hover:text-accent"
              >
                {s.value}
              </a>
            </p>
          ))}
        </div>
      ),
      social: () => commands.contact(),
      neofetch: () => (
        <div className="flex flex-col gap-4 sm:flex-row">
          <pre className="text-primary crt-glow leading-tight text-[10px] sm:text-xs" aria-hidden>
            {`   ______
  |  ___ \\
  | |  \\ \\  ___
  | |   | || _ |
  | |   | || __|
  | |__/ /  \\_ \\
  |_____/  |___/
   DERE PRIME`}
          </pre>
          <div className="space-y-0.5">
            <p>
              <span className="text-accent">{profile.user}</span>
              <span className="text-muted-foreground">@</span>
              <span className="text-accent">{profile.host}</span>
            </p>
            <p className="text-muted-foreground">-----------------</p>
            <p>
              <span className="text-primary">OS</span>: SA-MP Server 0.3.7
            </p>
            <p>
              <span className="text-primary">Host</span>: {profile.name}
            </p>
            <p>
              <span className="text-primary">Uptime</span>: {getAge(profile.birth)} años
            </p>
            <p>
              <span className="text-primary">Shell</span>: pawn-cc
            </p>
            <p>
              <span className="text-primary">Lang</span>: Pawn · JS · TS · React · C#
            </p>
            <p>
              <span className="text-primary">Location</span>: {profile.location}
            </p>
          </div>
        </div>
      ),
      date: () => <p className="text-muted-foreground">{new Date().toString()}</p>,
    }
  }, [])

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      // Eco del prompt + comando
      push(
        <div className="flex gap-1">
          <Prompt />
          <span className="text-foreground break-all">{raw}</span>
        </div>,
      )

      if (trimmed === "") return

      const [name, ...args] = trimmed.split(/\s+/)
      const cmd = name.toLowerCase()

      setCmdLog((l) => [...l, trimmed])
      setLogIndex(-1)

      if (cmd === "clear") {
        setHistory([])
        return
      }
      if (cmd === "echo") {
        push(<p className="text-foreground">{args.join(" ")}</p>)
        return
      }
      if (cmd === "sudo") {
        push(
          <p className="text-destructive">
            {profile.user} no está en el archivo sudoers. Este incidente será reportado.
          </p>,
        )
        return
      }
      if (cmd === "ls") {
        push(
          <p className="text-primary">
            about.txt skills.cfg projects/ samp.log contact.md{" "}
            <span className="text-muted-foreground">.secret</span>
          </p>,
        )
        return
      }

      const handler = commands[cmd]
      if (handler) {
        push(<div className="pb-1">{handler()}</div>)
      } else {
        push(
          <p className="text-destructive">
            comando no encontrado: {cmd}. Escribe <span className="text-primary">help</span> para ver
            las opciones.
          </p>,
        )
      }
    },
    [commands, push],
  )

  // Secuencia de arranque
  const bootDone = useRef(false)
  useEffect(() => {
    if (bootDone.current) return
    bootDone.current = true

    const boot = [
      <p key="b1" className="text-muted-foreground">
        Iniciando sesión en <span className="text-primary">{profile.host}</span>...
      </p>,
      <p key="b2" className="text-muted-foreground">
        [ <span className="text-primary">ok</span> ] cargando perfil de {profile.name}
      </p>,
      <div key="b3" className="pt-2">
        <p className="text-primary crt-glow text-lg sm:text-2xl font-bold tracking-tight">
          DERE PRIME // {profile.name}
        </p>
        <p className="text-muted-foreground text-pretty">{profile.tagline}</p>
      </div>,
      <p key="b4" className="pt-2 text-muted-foreground">
        Escribe <span className="text-accent">help</span> para empezar, o pulsa un comando abajo.
      </p>,
    ]

    boot.forEach((node, i) => {
      setTimeout(() => push(node), 350 * (i + 1))
    })
  }, [push])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [history])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return

    if (e.key === "Enter") {
      runCommand(input)
      setInput("")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (cmdLog.length === 0) return
      const idx = logIndex === -1 ? cmdLog.length - 1 : Math.max(0, logIndex - 1)
      setLogIndex(idx)
      setInput(cmdLog[idx])
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (logIndex === -1) return
      const idx = logIndex + 1
      if (idx >= cmdLog.length) {
        setLogIndex(-1)
        setInput("")
      } else {
        setLogIndex(idx)
        setInput(cmdLog[idx])
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      const all = [...HELP_ITEMS.map((h) => h.cmd), "echo", "sudo", "ls", "social"]
      const match = all.find((c) => c.startsWith(input.toLowerCase()) && input !== "")
      if (match) setInput(match)
    }
  }

  const quickCmds = ["whoami", "skills", "samp", "projects", "contact", "neofetch"]

  return (
    <div
      className="relative flex h-[80vh] max-h-[720px] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border bg-card/80 shadow-2xl shadow-black/50 backdrop-blur crt-flicker"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Barra de título */}
      <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-destructive/80" />
          <span className="h-3 w-3 rounded-full bg-accent/80" />
          <span className="h-3 w-3 rounded-full bg-primary/80" />
        </span>
        <span className="mx-auto text-xs text-muted-foreground select-none">
          {PROMPT_USER}: ~/portfolio — bash
        </span>
      </div>

      {/* Salida */}
      <div
        ref={scrollRef}
        className="terminal-scroll crt-scanlines relative flex-1 overflow-y-auto px-4 py-3 text-sm leading-relaxed"
      >
        {history.map((line) => (
          <div key={line.id}>{line.node}</div>
        ))}

        {/* Línea de entrada activa */}
        <div className="flex items-center gap-1">
          <Prompt />
          <div className="relative flex-1">
            <span className="break-all text-foreground">{input}</span>
            <span className="cursor-blink -mb-0.5 inline-block h-4 w-2 translate-y-0.5 bg-primary align-middle" />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="absolute inset-0 h-full w-full cursor-default opacity-0 outline-none"
              aria-label="Entrada de terminal"
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* Comandos rápidos */}
      <div className="flex flex-wrap gap-2 border-t border-border bg-secondary/40 px-4 py-2.5">
        {quickCmds.map((c) => (
          <button
            key={c}
            onClick={(e) => {
              e.stopPropagation()
              runCommand(c)
              inputRef.current?.focus()
            }}
            className="rounded border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
