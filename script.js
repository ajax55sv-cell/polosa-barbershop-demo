(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // Липкая кнопка записи: видна на телефонах, когда hero и форма вне экрана.
  const bar = $('#sticky');
  const hero = $('#top');
  const book = $('#zapis');
  if (bar && hero && book && 'IntersectionObserver' in window) {
    let heroSeen = true;
    let bookSeen = false;
    const update = () => bar.classList.toggle('is-visible', !heroSeen && !bookSeen);
    new IntersectionObserver(([entry]) => { heroSeen = entry.isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(([entry]) => { bookSeen = entry.isIntersecting; update(); }, { threshold: 0.1 }).observe(book);
  }

  // Ссылка «Записаться к ...» подставляет мастера в форму.
  const masterSelect = $('#f-master');
  $$('[data-master]').forEach((link) => {
    link.addEventListener('click', () => { if (masterSelect) masterSelect.value = link.dataset.master; });
  });

  // Форма записи.
  const form = $('#book-form');
  const done = $('#book-done');
  if (!form || !done) return;

  const whenInput = $('#f-when');
  if (whenInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    whenInput.min = now.toISOString().slice(0, 16);
  }

  const rules = {
    name: (value) => value.trim().length >= 2 ? '' : 'Укажите имя, чтобы мастер знал, как к вам обращаться.',
    phone: (value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length === 11 || (digits.length === 10 && !value.trim().startsWith('+'))
        ? ''
        : 'В номере не хватает цифр. Введите телефон полностью, например +7 900 123-45-67.';
    },
  };

  const showError = (input, message) => {
    const field = input.closest('.field');
    const out = $('.field__error', field);
    field.dataset.invalid = message ? 'true' : 'false';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    out.textContent = message;
  };

  const check = (input) => {
    const rule = rules[input.name];
    if (!rule) return true;
    const message = rule(input.value);
    showError(input, message);
    return !message;
  };

  // Ошибки показываем после первого ухода из поля, дальше проверяем при вводе.
  $$('input[name="name"], input[name="phone"]', form).forEach((input) => {
    let touched = false;
    input.addEventListener('blur', () => { touched = true; check(input); });
    input.addEventListener('input', () => { if (touched) check(input); });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const inputs = $$('input[name="name"], input[name="phone"]', form);
    const results = inputs.map(check);
    const firstBad = inputs[results.findIndex((ok) => !ok)];
    if (firstBad) { firstBad.focus(); return; }

    // TODO: отправить заявку (Telegram-бот, Formspree или своя форма). Сейчас данные никуда не уходят.
    $('#done-phone').textContent = $('#f-phone').value.trim();
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });

  $('#book-again').addEventListener('click', () => {
    form.reset();
    $$('.field', form).forEach((field) => { field.dataset.invalid = 'false'; $('.field__error', field).textContent = ''; });
    done.hidden = true;
    form.hidden = false;
    $('#f-name').focus();
  });
})();
