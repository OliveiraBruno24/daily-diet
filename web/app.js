const $ = (id) => document.getElementById(id)
const { porcao, substituir, MACROS } = window.Calc
const fmt = (n, d = 0) => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d })
const sinal = (n, d = 0) => (n > 0 ? '+' : '') + fmt(n, d)
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

// ---------- estado (localStorage) ----------
const KEY = 'daily-diet-v1'
let state = { meta: 2000, dias: {} } // dias: { 'YYYY-MM-DD': [{ id, refeicao, qtd }] }
try { state = { ...state, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch {}
const salvar = () => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {} }

const porNome = new Map(window.TACO.map((a) => [a.nome.toLowerCase(), a]))
const porId = new Map(window.TACO.map((a) => [a.id, a]))
const achar = (txt) => porNome.get(String(txt).trim().toLowerCase())

$('lista-alimentos').innerHTML = window.TACO.map((a) => `<option value="${esc(a.nome)}">${esc(a.categoria)}</option>`).join('')

// ---------- abas ----------
document.querySelectorAll('nav button').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('nav button').forEach((x) => x.classList.toggle('on', x === b))
  $('tab-dia').classList.toggle('hidden', b.dataset.tab !== 'dia')
  $('tab-sub').classList.toggle('hidden', b.dataset.tab !== 'sub')
}))

// ---------- aba Hoje ----------
const hoje = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)
$('data').value = hoje()
$('meta').value = state.meta
const dia = () => (state.dias[$('data').value] ||= [])

const somar = (itens) => itens.reduce((t, i) => {
  const p = porcao(porId.get(i.id), i.qtd)
  for (const k of ['kcal', 'p', 'c', 'g', 'f']) t[k] += p[k]
  return t
}, { kcal: 0, p: 0, c: 0, g: 0, f: 0 })

function renderDia() {
  const itens = dia().filter((i) => porId.has(i.id))
  const t = somar(itens)
  const meta = Number(state.meta) || 0
  $('tot-kcal').textContent = fmt(t.kcal)
  $('tot-meta').textContent = meta ? fmt(meta) : '—'
  const pct = meta ? (t.kcal / meta) * 100 : 0
  $('bar').classList.toggle('over', pct > 100)
  $('bar').firstElementChild.style.width = Math.min(pct, 100) + '%'
  $('restante').textContent = !meta ? 'Informe sua meta.'
    : t.kcal <= meta ? `${fmt(pct)}% da meta · faltam ${fmt(meta - t.kcal)} kcal`
    : `Meta ultrapassada em ${fmt(t.kcal - meta)} kcal`
  for (const k of ['p', 'c', 'g', 'f']) $('m-' + k).textContent = fmt(t[k], 1) + ' g'

  const refeicoes = [...$('refeicao').options].map((o) => o.value)
  $('diario').innerHTML = itens.length ? refeicoes.map((r) => {
    const doR = itens.filter((i) => i.refeicao === r)
    if (!doR.length) return ''
    return `<div class="meal-h">${r} · ${fmt(somar(doR).kcal)} kcal</div><table>` + doR.map((i) => {
      const a = porId.get(i.id), p = porcao(a, i.qtd)
      return `<tr><td>${esc(a.nome)}<br><span class="muted">${fmt(i.qtd)} g</span></td><td>${fmt(p.kcal)} kcal</td>
        <td><button class="link" data-del="${i.uid}" title="Remover">✕</button></td></tr>`
    }).join('') + '</table>'
  }).join('') : '<div class="muted">Nada registrado neste dia.</div>'

  const cats = {}
  for (const i of itens) {
    const a = porId.get(i.id)
    cats[a.categoria] ||= { kcal: 0, p: 0, c: 0, g: 0 }
    const p = porcao(a, i.qtd)
    for (const k of ['kcal', 'p', 'c', 'g']) cats[a.categoria][k] += p[k]
  }
  const linhas = Object.entries(cats).sort((a, b) => b[1].kcal - a[1].kcal)
  $('por-cat').innerHTML = linhas.length
    ? '<tr><th>Categoria</th><th>kcal</th><th>% do total</th><th>P</th><th>C</th><th>G</th></tr>' +
      linhas.map(([n, v]) => `<tr><td>${esc(n)}</td><td>${fmt(v.kcal)}</td><td>${fmt((v.kcal / t.kcal) * 100)}%</td>
        <td>${fmt(v.p, 1)}</td><td>${fmt(v.c, 1)}</td><td>${fmt(v.g, 1)}</td></tr>`).join('')
    : '<tr><td class="muted">—</td></tr>'
}

function previewAdd() {
  const a = achar($('busca').value), q = Number($('qtd').value)
  $('preview').textContent = a && q > 0
    ? (({ kcal, p, c, g }) => `${fmt(kcal)} kcal · P ${fmt(p, 1)} g · C ${fmt(c, 1)} g · G ${fmt(g, 1)} g`)(porcao(a, q))
    : ''
}

$('meta').addEventListener('input', () => { state.meta = Number($('meta').value) || 0; salvar(); renderDia() })
$('data').addEventListener('change', renderDia)
$('busca').addEventListener('input', previewAdd)
$('qtd').addEventListener('input', previewAdd)
$('add').addEventListener('click', () => {
  const a = achar($('busca').value), q = Number($('qtd').value)
  if (!a) return alert('Escolha um alimento da lista da TACO.')
  if (!(q > 0)) return alert('Informe a quantidade em gramas.')
  dia().push({ uid: Date.now() + Math.random(), id: a.id, qtd: q, refeicao: $('refeicao').value })
  salvar(); $('busca').value = ''; $('qtd').value = ''; previewAdd(); renderDia()
})
$('diario').addEventListener('click', (e) => {
  const uid = e.target.dataset.del
  if (!uid) return
  state.dias[$('data').value] = dia().filter((i) => String(i.uid) !== uid)
  salvar(); renderDia()
})

// ---------- aba Substituíveis ----------
function renderSub() {
  const ref = achar($('s-ref').value), sub = achar($('s-sub').value), q = Number($('s-ref-qtd').value)
  const out = $('s-result')
  if (!ref || !sub || !(q > 0)) { out.innerHTML = '<div class="muted">Preencha o alimento de referência, a quantidade e o substituto.</div>'; return }
  const r = substituir(ref, q, sub, $('s-macro').value)
  if (r.impossivel) { out.innerHTML = `<div class="muted">${esc(sub.nome)} não tem ${MACROS[r.macro]} na tabela — escolha outro macro para igualar.</div>`; return }
  const cls = (d) => (Math.abs(d) < 0.5 ? 'ok' : d > 0 ? 'pos' : 'neg')
  const linha = (nome, k, d, un) => `<tr><td>${nome}</td><td>${fmt(r.ref[k], d)} ${un}</td><td>${fmt(r.nova[k], d)} ${un}</td>
    <td class="${cls(r.dif[k])}">${sinal(r.dif[k], d)} ${un}</td></tr>`
  out.innerHTML = `
    <div class="result">Para igualar <b>${MACROS[r.macro]}</b>, coma <b>${fmt(r.gramas)} g</b> de ${esc(sub.nome)}.</div>
    <div class="result">Diferença de calorias: <b class="${cls(r.dif.kcal)}">${sinal(r.dif.kcal)} kcal</b>
      <span class="muted">(${r.dif.kcal > 0 ? 'a mais' : r.dif.kcal < 0 ? 'a menos' : 'igual'} que a referência)</span></div>
    <table style="margin:10px 0">
      <tr><th></th><th>Referência (${fmt(q)} g)</th><th>Substituto (${fmt(r.gramas)} g)</th><th>Diferença</th></tr>
      ${linha('Calorias', 'kcal', 0, 'kcal')}${linha('Proteína', 'p', 1, 'g')}${linha('Carboidrato', 'c', 1, 'g')}
      ${linha('Gordura', 'g', 1, 'g')}${linha('Fibra', 'f', 1, 'g')}
    </table>
    <button class="pri" id="s-add">Adicionar substituto ao dia de hoje</button>`
  $('s-add').onclick = () => {
    dia().push({ uid: Date.now() + Math.random(), id: sub.id, qtd: Math.round(r.gramas), refeicao: $('refeicao').value })
    salvar(); renderDia()
    document.querySelector('[data-tab=dia]').click()
  }
}
for (const id of ['s-ref', 's-ref-qtd', 's-sub', 's-macro']) $(id).addEventListener('input', renderSub)

renderDia(); renderSub()
