// elements
const toggleBtn = document.getElementById('toggleNav')
const drawer = document.getElementById('mainNav')
const navLinks = drawer.querySelectorAll('a')
const sections = document.querySelectorAll('main section[id]')
const dataButtons = document.querySelectorAll('[data-target]')

let currentSectionId = null

/* ---- handler para botões com data-target (ex: VEJA MAIS) ---- */
dataButtons.forEach((btn) => {
  btn.addEventListener('click', (ev) => {
    const sel = btn.getAttribute('data-target')
    if (!sel) return
    const target = document.querySelector(sel)
    if (!target) return
    // se o botão for parte de um form, prevenir envio (segurança)
    if (ev && typeof ev.preventDefault === 'function') ev.preventDefault()

    // rolagem suave; sections devem ter scroll-margin-top definido no CSS
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })

    // opcional: atualizar link ativo imediatamente (o observer também fará isso)
    setTimeout(() => setActiveLink(target.id), 300)
  })
})

/* ---- Toggle drawer ---- */
toggleBtn.addEventListener('click', () => {
  const closed = drawer.classList.contains('closed')
  drawer.classList.toggle('closed')
  toggleBtn.setAttribute('aria-expanded', String(closed))
  drawer.setAttribute('aria-hidden', String(!closed))
  toggleBtn.title = closed ? 'fechar menu' : 'abrir menu'

  // quando abrir, garante que o link ativo esteja visível e pintado
  if (!drawer.classList.contains('closed')) {
    setActiveLink(currentSectionId)
    const active = drawer.querySelector('a.active')
    if (active) active.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
})

/* ---- fechar drawer ao clicar em um link (mobile) e scroll suave ---- */
navLinks.forEach((a) => {
  a.addEventListener('click', (ev) => {
    const href = a.getAttribute('href')
    if (href && href.startsWith('#')) {
      ev.preventDefault()
      const target = document.querySelector(href)
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // fecha drawer em telas pequenas / mobile
    drawer.classList.add('closed')
    toggleBtn.setAttribute('aria-expanded', 'false')
    drawer.setAttribute('aria-hidden', 'true')
  })
})

/* ---- função que seta a classe .active nos links do nav ---- */
function setActiveLink(id) {
  currentSectionId = id || currentSectionId
  navLinks.forEach((a) => {
    const href = a.getAttribute('href')
    const shouldBeActive = href === `#${currentSectionId}`
    a.classList.toggle('active', shouldBeActive)
    if (shouldBeActive) {
      a.setAttribute('aria-current', 'true')
    } else {
      a.removeAttribute('aria-current')
    }
  })
}

/* ---- IntersectionObserver para acompanhar seção visível ---- */
if ('IntersectionObserver' in window && sections.length) {
  const ioOptions = {
    root: null,
    rootMargin: '0px',
    threshold: [0.52, 0.6], // detectar quando a seção está ocupando boa parte da viewport
  }

  const io = new IntersectionObserver((entries) => {
    // escolhemos a entrada com isIntersecting true e maior intersectionRatio
    let best = null
    entries.forEach((en) => {
      if (en.isIntersecting) {
        if (!best || en.intersectionRatio > best.intersectionRatio) best = en
      }
    })
    if (best && best.target && best.target.id) {
      // atualiza o link ativo
      setActiveLink(best.target.id)
    }
  }, ioOptions)

  sections.forEach((s) => io.observe(s))
} else {
  // fallback simples por scroll (se IntersectionObserver não suportado)
  const findCurrentByScroll = () => {
    const mid = window.innerHeight / 2
    let bestId = sections[0]?.id || null
    let bestDist = Infinity
    sections.forEach((s) => {
      const rect = s.getBoundingClientRect()
      const dist = Math.abs(rect.top + rect.height / 2 - mid)
      if (dist < bestDist) {
        bestDist = dist
        bestId = s.id
      }
    })
    setActiveLink(bestId)
  }
  window.addEventListener('scroll', findCurrentByScroll)
  window.addEventListener('resize', findCurrentByScroll)
  // inicializa
  findCurrentByScroll()
}

/* ---- inicialização: tenta definir o ativo logo ao carregar a página ---- */
window.addEventListener('load', () => {
  // pequena espera para garantir que o observer fez seu trabalho
  setTimeout(() => {
    if (!currentSectionId) {
      // se nada detectado, faz uma checagem por posição
      const y = window.scrollY + window.innerHeight / 2
      let best = null
      sections.forEach((s) => {
        const rect = s.getBoundingClientRect()
        const topAbs = window.scrollY + rect.top
        const bottomAbs = topAbs + rect.height
        if (y >= topAbs && y <= bottomAbs) best = s
      })
      if (best) setActiveLink(best.id)
    } else {
      setActiveLink(currentSectionId)
    }
  }, 120)
})
