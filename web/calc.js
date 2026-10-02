// Funções puras de cálculo (valores TACO são por 100 g).
(function (root) {
  const MACROS = { c: 'carboidrato', p: 'proteína', g: 'gordura', kcal: 'calorias' }

  function porcao(alimento, gramas) {
    const k = gramas / 100
    return { kcal: alimento.kcal * k, p: alimento.p * k, c: alimento.c * k, g: alimento.g * k, f: alimento.f * k }
  }

  // Macro com maior contribuição calórica (4 kcal/g para p e c, 9 kcal/g para g).
  function macroPrincipal(alimento) {
    const cal = { c: alimento.c * 4, p: alimento.p * 4, g: alimento.g * 9 }
    return Object.keys(cal).reduce((a, b) => (cal[b] > cal[a] ? b : a))
  }

  // Quantos gramas de `sub` igualam `macro` da porção de referência.
  function substituir(ref, refGramas, sub, macro) {
    if (macro === 'auto') macro = macroPrincipal(ref)
    const alvo = porcao(ref, refGramas)
    const por100 = sub[macro]
    if (!(por100 > 0)) return { macro, impossivel: true }
    const gramas = (alvo[macro] / por100) * 100
    const nova = porcao(sub, gramas)
    return {
      macro, gramas, ref: alvo, nova,
      dif: { kcal: nova.kcal - alvo.kcal, p: nova.p - alvo.p, c: nova.c - alvo.c, g: nova.g - alvo.g, f: nova.f - alvo.f },
    }
  }

  const api = { MACROS, porcao, macroPrincipal, substituir }
  if (typeof module !== 'undefined') module.exports = api
  else root.Calc = api
})(typeof window !== 'undefined' ? window : globalThis)
