document.addEventListener('DOMContentLoaded', () => {
  /* ----------------------
     NAV / DRAWER / SCROLL
     ---------------------- */
  const toggleBtn = document.getElementById('toggleNav')
  const drawer = document.getElementById('mainNav')
  const navLinks = drawer ? drawer.querySelectorAll('a') : []
  const sections = document.querySelectorAll('main section[id]')
  const dataButtons = document.querySelectorAll('[data-target]')
  let currentSectionId = null

  const safe = (fn) => {
    try {
      fn()
    } catch (e) {}
  }

  dataButtons.forEach((btn) => {
    btn.addEventListener('click', (ev) => {
      const sel = btn.getAttribute('data-target')
      if (!sel) return
      const target = document.querySelector(sel)
      if (!target) return
      if (ev && typeof ev.preventDefault === 'function') ev.preventDefault()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => setActiveLink(target.id), 300)
    })
  })

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      const closed = drawer.classList.contains('closed')
      drawer.classList.toggle('closed')
      toggleBtn.setAttribute('aria-expanded', String(closed))
      drawer.setAttribute('aria-hidden', String(!closed))
      toggleBtn.title = closed ? 'fechar menu' : 'abrir menu'
      if (!drawer.classList.contains('closed')) {
        setActiveLink(currentSectionId)
        const active = drawer.querySelector('a.active')
        if (active)
          active.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    })
  }

  navLinks.forEach((a) => {
    a.addEventListener('click', (ev) => {
      const href = a.getAttribute('href')
      if (href && href.startsWith('#')) {
        ev.preventDefault()
        const target = document.querySelector(href)
        if (target)
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      if (drawer) {
        drawer.classList.add('closed')
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false')
        drawer.setAttribute('aria-hidden', 'true')
      }
    })
  })

  function setActiveLink(id) {
    currentSectionId = id || currentSectionId
    navLinks.forEach((a) => {
      const href = a.getAttribute('href')
      const shouldBeActive = href === `#${currentSectionId}`
      a.classList.toggle('active', shouldBeActive)
      if (shouldBeActive) a.setAttribute('aria-current', 'true')
      else a.removeAttribute('aria-current')
    })
  }

  // IntersectionObserver for active section
  if ('IntersectionObserver' in window && sections.length) {
    const ioOptions = { root: null, rootMargin: '0px', threshold: [0.52, 0.6] }
    const io = new IntersectionObserver((entries) => {
      let best = null
      entries.forEach((en) => {
        if (en.isIntersecting) {
          if (!best || en.intersectionRatio > best.intersectionRatio) best = en
        }
      })
      if (best && best.target && best.target.id) setActiveLink(best.target.id)
    }, ioOptions)
    sections.forEach((s) => io.observe(s))
  } else {
    // fallback
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
    findCurrentByScroll()
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      if (!currentSectionId) {
        const y = window.scrollY + window.innerHeight / 2
        let best = null
        sections.forEach((s) => {
          const rect = s.getBoundingClientRect()
          const topAbs = window.scrollY + rect.top
          const bottomAbs = topAbs + rect.height
          if (y >= topAbs && y <= bottomAbs) best = s
        })
        if (best) setActiveLink(best.id)
      } else setActiveLink(currentSectionId)
    }, 120)
  })

  /* ----------------------
     CARROSSEL DE PROJETOS
     ---------------------- */
  ;(function initCarousel() {
    const carousel = document.querySelector('.projects-carousel')
    if (!carousel) return

    const track = carousel.querySelector('.carousel-track')
    const items = Array.from(carousel.querySelectorAll('.carousel-item'))
    const prevBtn = carousel.querySelector('.carousel-btn.prev')
    const nextBtn = carousel.querySelector('.carousel-btn.next')
    const dotsWrap = carousel.querySelector('.carousel-dots')
    const viewport = carousel.querySelector('.carousel-viewport')

    if (!track || items.length === 0 || !viewport) return

    function slidesToShow() {
      const w = window.innerWidth
      if (w >= 1100) return 3
      if (w >= 700) return 2
      return 1
    }

    let perView = slidesToShow()
    let index = 0
    let isDragging = false
    let startX = 0
    let currentTranslate = 0
    let prevTranslate = 0

    function createDots() {
      if (!dotsWrap) return
      dotsWrap.innerHTML = ''
      const pages = Math.max(1, items.length - perView + 1)
      for (let i = 0; i < pages; i++) {
        const btn = document.createElement('button')
        btn.setAttribute('aria-label', 'Ir para página ' + (i + 1))
        btn.addEventListener('click', () => goTo(i))
        dotsWrap.appendChild(btn)
      }
      updateDots()
    }

    function updateDots() {
      if (!dotsWrap) return
      const dots = Array.from(dotsWrap.children)
      dots.forEach((d, i) => d.classList.toggle('active', i === index))
    }

    function updateLayout() {
      perView = slidesToShow()
      const maxIndex = Math.max(0, items.length - perView)
      if (index > maxIndex) index = maxIndex
      const viewportWidth = viewport.clientWidth
      const itemWidth = Math.floor(viewportWidth / perView)
      items.forEach((it) => (it.style.width = itemWidth + 'px'))
      track.style.transform = `translateX(${-index * itemWidth}px)`
      updateButtons()
      createDots()
    }

    function updateButtons() {
      if (!prevBtn || !nextBtn) return
      const maxIndex = Math.max(0, items.length - perView)
      prevBtn.disabled = index <= 0
      nextBtn.disabled = index >= maxIndex
    }

    function goTo(i) {
      const viewportWidth = viewport.clientWidth
      const itemWidth = Math.floor(viewportWidth / perView)
      const maxIndex = Math.max(0, items.length - perView)
      index = Math.min(Math.max(0, i), maxIndex)
      track.style.transition = 'transform 320ms cubic-bezier(.2,.9,.3,1)'
      track.style.transform = `translateX(${-index * itemWidth}px)`
      setTimeout(() => (track.style.transition = ''), 360)
      updateButtons()
      updateDots()
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1))
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1))

    // keyboard arrows
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goTo(index - 1)
      if (e.key === 'ArrowRight') goTo(index + 1)
    })

    // pointer drag (mouse & touch)
    track.addEventListener('pointerdown', (e) => {
      // ADICIONE ESTA VERIFICAÇÃO AQUI
      if (e.target.closest('a')) {
        return
      }

      isDragging = true
      startX = e.clientX
      track.style.transition = ''
      const viewportWidth = viewport.clientWidth
      prevTranslate = -index * Math.floor(viewportWidth / perView)
      currentTranslate = prevTranslate
      try {
        track.setPointerCapture && track.setPointerCapture(e.pointerId)
      } catch (err) {}
    })

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return
      const dx = e.clientX - startX
      currentTranslate = prevTranslate + dx
      track.style.transform = `translateX(${currentTranslate}px)`
    })

    window.addEventListener('pointerup', (e) => {
      if (!isDragging) return
      isDragging = false
      const viewportWidth = viewport.clientWidth
      const itemWidth = Math.floor(viewportWidth / perView)
      const moved = -(currentTranslate - prevTranslate)
      if (moved > itemWidth / 3) goTo(index + 1)
      else if (moved < -itemWidth / 3) goTo(index - 1)
      else goTo(index)
    })

    // resize
    let resizeTimer
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => updateLayout(), 120)
    })

    // initial layout
    updateLayout()

    // click whole card opens repo if not clicking a link
    items.forEach((item) => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('a')) return
        const link = item.dataset.github
        if (link) window.open(link, '_blank', 'noopener')
      })
    })

    // expose updateLayout for debugging if needed
    carousel.__updateLayout = updateLayout
  })()
}) // end DOMContentLoaded+

// ==================================================================
// LÓGICA PARA ENVIO DO FORMULÁRIO DE CONTATO SEM RECARREGAR A PÁGINA
// ==================================================================
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('portfolio-contact-form')

  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      // 1. Impede o comportamento padrão do formulário (recarregar a página)
      event.preventDefault()

      const submitButton = contactForm.querySelector('button[type="submit"]')
      const formData = new FormData(contactForm)

      // 2. Dá um feedback visual para o usuário
      submitButton.disabled = true
      submitButton.textContent = 'Enviando...'

      // 3. Usa a API Fetch para enviar os dados em segundo plano
      fetch('https://formsubmit.co/ajax/nicolasdanielmalheiros@gmail.com', {
        // <<< MUITO IMPORTANTE: TROQUE PELO SEU E-MAIL AQUI! >>>
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json()
          }
          // Se a resposta não for OK, lança um erro para ser pego pelo .catch
          throw new Error('Houve um problema com a resposta do servidor.')
        })
        .then((data) => {
          // 4. Ação em caso de SUCESSO
          contactForm.reset() // Limpa os campos do formulário
        })
        .catch((error) => {
          // 5. Ação em caso de ERRO
          console.error('Erro ao enviar o formulário:', error)
          alert(
            'Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.'
          )
        })
        .finally(() => {
          // 6. Roda sempre no final, para reativar o botão
          submitButton.disabled = false
          submitButton.textContent = 'Enviar'
        })
    })
  }
})
