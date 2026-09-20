# Прототип портала конференций РТУ МИРЭА

Дизайн-независимый многостраничный frontend-прототип портала конференций одной из кафедр РТУ МИРЭА.

Прототип содержит каталог конференций, страницу конференции, программу, страницу события, архив, материалы, галерею, глобальный поиск и страницу 404. Все страницы работают локально без сборки и готовы к дальнейшему переносу в Django-шаблоны.

Откройте `index.html`, чтобы просмотреть сайт локально.

## Визуальные темы

Все темы используют одну HTML-структуру и переключаются кнопкой «Тема» в шапке или параметром `theme` в URL:

- `?theme=foundation` — Editorial Tech (`assets/css/theme-foundation.css`)
- `?theme=archive` — Archive Paper (`assets/css/theme-archive.css`)
- `?theme=signal` — Signal Grid (`assets/css/theme-signal.css`)
- `?theme=axis` — Axis Rail (`assets/css/theme-axis.css`)
- `?theme=cloud` — Cloud Atelier (`assets/css/theme-cloud.css`)
- `?theme=nocturne` — Nocturne Stage (`assets/css/theme-nocturne.css`)

Выбор сохраняется в браузере при переходе между страницами.
