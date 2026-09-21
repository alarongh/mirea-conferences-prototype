# Прототип портала конференций РТУ МИРЭА

Дизайн-независимый многостраничный frontend-прототип портала конференций одной из кафедр РТУ МИРЭА.

Прототип содержит каталог конференций, страницу конференции, программу, страницу события, архив, материалы, галерею, глобальный поиск и страницу 404. Все страницы работают локально без сборки и готовы к дальнейшему переносу в Django-шаблоны.

Откройте `index.html`, чтобы просмотреть сайт локально.

## Визуальные темы

Все темы используют одну HTML-структуру и переключаются кнопкой «Тема» в шапке или параметром `theme` в URL:

- `?theme=foundation` — Editorial Field (`assets/css/theme-foundation.css`)
- `?theme=archive` — Archive Paper (`assets/css/theme-archive.css`)
- `?theme=signal` — Signal Grid (`assets/css/theme-signal.css`)
- `?theme=axis` — Axis Rail (`assets/css/theme-axis.css`)
- `?theme=cloud` — Cloud Atelier (`assets/css/theme-cloud.css`)
- `?theme=nocturne` — Nocturne Stage (`assets/css/theme-nocturne.css`)

Выбор сохраняется в браузере при переходе между страницами.

Контент главного экрана хранится в `window.PORTAL_CURRENT_CONFERENCE` внутри `assets/js/data.js`. Заголовок, описание, даты, площадка, формат и статус выводятся в универсальный компонент без привязки декоративной графики к названию конференции. При переносе в Django эти поля заменяются значениями модели без изменения HTML-структуры.
