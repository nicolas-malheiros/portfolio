// lógica do toggle da nav/drawer
const toggleBtn = document.getElementById('toggleNav');
const drawer = document.getElementById('mainNav');

toggleBtn.addEventListener('click', () => {
  const closed = drawer.classList.contains('closed');
  drawer.classList.toggle('closed');
  toggleBtn.setAttribute('aria-expanded', String(closed));
  drawer.setAttribute('aria-hidden', String(!closed));
  // muda tooltip simples
  toggleBtn.title = closed ? 'fechar menu' : 'abrir menu';
});

// fechar drawer ao clicar em link (útil para mobile)
drawer.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    drawer.classList.add('closed');
    toggleBtn.setAttribute('aria-expanded','false');
    drawer.setAttribute('aria-hidden','true');
  });
});

// botão 'veja mais' rola para a seção alvo (data-target)
document.querySelectorAll('[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const sel = btn.getAttribute('data-target');
    document.querySelector(sel).scrollIntoView({behavior:'smooth'});
  });
});