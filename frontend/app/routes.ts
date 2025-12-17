import { type RouteConfig, index, route, layout } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('signin', 'routes/signin.tsx'),
  layout('components/layout/main-layout.tsx', [
    route('dashboard', 'routes/dashboard.tsx'),
    route('invest', 'routes/invest.tsx'),
    route('savings', 'routes/savings.tsx'),
    route('transfers', 'routes/transfers.tsx'),
    route('cards', 'routes/cards.tsx'),
  ]),
] satisfies RouteConfig;
