import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"

const localEnv = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=")
      return [line.slice(0, separator), line.slice(separator + 1)]
    }),
)

const supabaseUrl = localEnv.NEXT_PUBLIC_SUPABASE_URL
const publishableKey = localEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
assert.ok(supabaseUrl && publishableKey, "Set local Supabase URL and publishable key in .env.local")
assert.ok(["127.0.0.1", "localhost"].includes(new URL(supabaseUrl).hostname), "Integration tests only run against a local Supabase URL")

const appUrl = process.env.LOCAL_APP_URL || "http://127.0.0.1:3000"
assert.ok(["127.0.0.1", "localhost"].includes(new URL(appUrl).hostname), "Integration tests only run against a local app URL")
const supabaseCli = process.platform === "win32" ? "supabase.exe" : "supabase"
const cliOutput = execFileSync(supabaseCli, ["status", "-o", "json"], {
  encoding: "utf8",
  env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
})
const statusJson = cliOutput.slice(cliOutput.indexOf("{"))
const localStatus = JSON.parse(statusJson)
assert.equal(localStatus.API_URL, supabaseUrl, "The configured Supabase URL must match the local CLI stack")
assert.ok(localStatus.SERVICE_ROLE_KEY, "Local Supabase service role key is unavailable for test fixture cleanup")

const admin = createClient(supabaseUrl, localStatus.SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function executeLocalSql(sql) {
  execFileSync(supabaseCli, ["db", "query", "--local", sql], {
    encoding: "utf8",
    env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
  })
}

const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
const users = []
const channels = []
let examId
let reportPath
let realtimeTimeout

function pass(description) {
  console.log(`PASS ${description}`)
}

async function createTestUser(label) {
  const userClient = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data, error } = await userClient.auth.signUp({
    email: `sprint2-${label}-${suffix}@example.test`,
    password: `Test-${crypto.randomUUID()}!`,
    options: { data: { full_name: `Sprint 2 ${label}` } },
  })
  assert.ifError(error)
  assert.ok(data.user && data.session, "Local email auth must issue a confirmed test session")
  users.push({ id: data.user.id, client: userClient, session: data.session })
  return users.at(-1)
}

async function appCookie(session) {
  const jar = new Map()
  const serverClient = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (values) => values.forEach(({ name, value }) => jar.set(name, value)),
    },
  })
  const { error } = await serverClient.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })
  assert.ifError(error)
  assert.ok(jar.size > 0, "SSR auth client should serialize a session cookie")
  return [...jar].map(([name, value]) => `${name}=${value}`).join("; ")
}

async function api(path, { cookie, ...options } = {}) {
  const headers = new Headers(options.headers)
  if (cookie) headers.set("cookie", cookie)
  return fetch(new URL(path, appUrl), { ...options, headers })
}

async function expectStatus(response, expected) {
  const body = response.status === expected ? "" : await response.text()
  assert.equal(response.status, expected, body)
}

let realtimeEvent;

try {
  const userA = await createTestUser("a")
  const userB = await createTestUser("b")
  const cookieA = await appCookie(userA.session)
  const cookieB = await appCookie(userB.session)
  pass("local email signup creates two authenticated test users")

  const appointmentResponse = await api("/api/appointments", {
    cookie: cookieA,
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      doctorId: "doc_001",
      scheduledAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      type: "telemedicine",
      notes: "local integration test",
    }),
  })
  await expectStatus(appointmentResponse, 201)
  const { appointment } = await appointmentResponse.json()

  const listResponse = await api("/api/appointments", { cookie: cookieA })
  assert.equal(listResponse.status, 200)
  assert.ok((await listResponse.json()).appointments.some((item) => item.id === appointment.id))

  const patchResponse = await api(`/api/appointments/${appointment.id}`, {
    cookie: cookieA,
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ notes: "rescheduled by local integration test" }),
  })
  await expectStatus(patchResponse, 200)
  assert.equal((await patchResponse.json()).appointment.notes, "rescheduled by local integration test")

  const hiddenResponse = await api("/api/appointments", { cookie: cookieB })
  assert.equal(hiddenResponse.status, 200)
  assert.ok(!(await hiddenResponse.json()).appointments.some((item) => item.id === appointment.id))
  const forbiddenPatch = await api(`/api/appointments/${appointment.id}`, {
    cookie: cookieB,
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ notes: "must not change" }),
  })
  assert.equal(forbiddenPatch.status, 404)

  const deleteResponse = await api(`/api/appointments/${appointment.id}`, { cookie: cookieA, method: "DELETE" })
  assert.equal(deleteResponse.status, 200)
  pass("appointment API creates, lists, updates, deletes, and enforces owner isolation")

  examId = crypto.randomUUID()
  executeLocalSql(`insert into public.exams (id, user_id, name, performed_at) values ('${examId}', '${userA.id}', 'Sprint 2 local PDF test', current_date)`)

  const form = new FormData()
  form.append("file", new File(["%PDF-1.7\nlocal-only integration fixture\n%%EOF"], "report.pdf", { type: "application/pdf" }))
  const uploadResponse = await api(`/api/exams/${examId}/report`, { cookie: cookieA, method: "POST", body: form })
  await expectStatus(uploadResponse, 201)

  const reportResponse = await api(`/api/exams/${examId}/report`, { cookie: cookieA })
  await expectStatus(reportResponse, 200)
  const signedReport = await reportResponse.json()
  const pdfResponse = await fetch(signedReport.url)
  assert.equal(pdfResponse.status, 200)
  assert.ok(new TextDecoder().decode(await pdfResponse.arrayBuffer()).startsWith("%PDF-1.7"))

  const { data: examRow, error: reportPathError } = await userA.client
    .from("exams")
    .select("report_path")
    .eq("id", examId)
    .single()
  assert.ifError(reportPathError)
  reportPath = examRow.report_path
  assert.ok(reportPath.startsWith(`${userA.id}/`))

  const otherUserDownload = await userB.client.storage.from("medical-reports").download(reportPath)
  assert.ok(otherUserDownload.error, "Another patient must not download this report")
  const hiddenReport = await api(`/api/exams/${examId}/report`, { cookie: cookieB })
  assert.equal(hiddenReport.status, 404)
  pass("PDF API validates, uploads, signs, reads, and scopes reports to the owner")

  let resolveRealtime
  const realtimePromise = new Promise((resolve) => { resolveRealtime = resolve })
  realtimeTimeout = setTimeout(() => resolveRealtime(null), 15000)
  await userA.client.realtime.setAuth(userA.session.access_token)
  const channel = userA.client
    .channel(`sprint2-notifications-${suffix}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "notifications",
      filter: `user_id=eq.${userA.id}`,
    }, (payload) => resolveRealtime(payload))
  channels.push({ client: userA.client, channel })

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Realtime subscription timed out")), 15000)
    channel.subscribe((state, error) => {
      if (state === "SUBSCRIBED") {
        clearTimeout(timeout)
        resolve()
      } else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(state)) {
        clearTimeout(timeout)
        reject(error || new Error(`Realtime subscription ended: ${state}`))
      }
    })
  })

  executeLocalSql(`insert into public.notifications (user_id, title, message, type) values ('${userA.id}', 'Realtime local integration test', 'Fictional local integration fixture', 'general')`)
  realtimeEvent = await realtimePromise
  clearTimeout(realtimeTimeout)
  assert.ok(realtimeEvent, "Expected a notifications INSERT over the Realtime websocket")
  assert.equal(realtimeEvent.new.user_id, userA.id)
  assert.equal(realtimeEvent.new.title, "Realtime local integration test")
  pass("Realtime delivers an owner-filtered notification event over WebSocket")
} finally {
  clearTimeout(realtimeTimeout)
  for (const { client, channel } of channels) {
    await client.removeChannel(channel).catch(() => {})
  }
  await Promise.all(users.map(({ client }) => client.realtime.disconnect().catch(() => {})))
  if (!reportPath && examId && users[0]) {
    const { data } = await users[0].client.from("exams").select("report_path").eq("id", examId).maybeSingle()
    reportPath = data?.report_path
  }
  if (reportPath && users[0]) {
    await users[0].client.storage.from("medical-reports").remove([reportPath]).catch(() => {})
  }
  if (users.length) {
    await Promise.all(users.map(({ id }) => admin.auth.admin.deleteUser(id).catch(() => {})))
  }
}
