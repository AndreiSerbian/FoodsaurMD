# Система управления точками выдачи

## Что реализовано

### База данных
- ✅ Обновлена таблица `pickup_points` (добавлены поля `title`, `city`, `work_hours`, `slug`)
- ✅ Автогенерация slug через триггер
- ✅ Индексы для производительности

### Модули (JS)
- `src/modules/points/pointsApi.js` - CRUD операции через Supabase
- `src/modules/points/workHoursUtil.js` - работа с расписанием, статус "открыто/закрыто"
- `src/modules/cart/cartRules.js` - правило "один производитель, одна точка"

### Компоненты (TS)
- `PointsAdminTable.tsx` - список точек для админки
- `PointModal.tsx` - модалка добавления/редактирования с расписанием
- `PointsPublicGrid.tsx` - публичная сетка выбора точки

### Страницы (JS)
- `pages/admin/Points.jsx` - админ панель точек
- `pages/producer/Points.jsx` - панель производителя
- `pages/ProducerPoints.jsx` - публичная страница `/producer/:slug/points`

### Интеграция
- ✅ Обновлен `CartContext` с правилами точек
- ✅ Добавлен хук `usePoints.ts`
- ✅ Типизация в `types/supabase-points.d.ts`

## Добавить в роутер
```jsx
// В App.tsx или router config
<Route path="/producer/:producerSlug/points" element={<ProducerPoints />} />
<Route path="/admin/points" element={<AdminPoints />} />
<Route path="/producer/points" element={<ProducerPointsManagement />} />
```

## Права доступа
- **Админ**: все точки
- **Производитель**: только свои точки  
- **Анонимы**: просмотр активных точек

## Ключевые функции
- ✅ CRUD точек через модалки
- ✅ Сложное расписание работы (JSON)
- ✅ Автоматический слаг
- ✅ Правило "одна точка в корзине"
- ✅ Публичный выбор точки при ≥2 точках
- ✅ Статус "открыто сейчас"