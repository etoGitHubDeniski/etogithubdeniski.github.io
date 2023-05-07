function toggleMenu() {
  const navMain = document.querySelector('.header__navigation');
  const menuIcon = document.querySelector('.header__toggle');

  if (navMain.classList.contains('header__navigation--open')) {
    navMain.classList.remove('header__navigation--open');
    menuIcon.classList.remove('header__toggle--cross');
  } else {
    navMain.classList.add('header__navigation--open');
    menuIcon.classList.add('header__toggle--cross');
  }
}

const menuToggleBtn = document.querySelector('.header__toggle');
menuToggleBtn.addEventListener('click', toggleMenu);

/// 2
function handleTabletChange(e) {
  const aboutTitle = document.querySelector('.about__title');

  if (e.matches) {
    aboutTitle.innerHTML = 'Более 5 лет создаем мебель для вашего комфорта';
  } else {
    aboutTitle.innerHTML = 'О компании';
  }
}

const mediaQuery = window.matchMedia('(min-width: 1448px)');
mediaQuery.addListener(handleTabletChange);
handleTabletChange(mediaQuery);
