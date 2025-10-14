# ITpipes Prototype

Проект Next.js з TypeScript, Tailwind CSS та shadcn/ui компонентами.

## Стек технологій

- **Next.js 15** - React фреймворк
- **TypeScript** - типізація
- **Tailwind CSS** - стилізація
- **shadcn/ui** - UI компоненти

## Початок роботи

Запустіть development сервер:

```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000) у браузері.

## Додавання shadcn/ui компонентів

Для додавання нових компонентів shadcn/ui використовуйте:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
# і т.д.
```

## Структура проекту

```
/app          - сторінки та layouts (App Router)
/lib          - утиліти (utils.ts для cn())
/components   - shadcn/ui компоненти (створюється автоматично)
/public       - статичні файли
```

## Корисні посилання

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
