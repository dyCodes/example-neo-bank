import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import type { Route } from './+types/home';
import { isAuthenticated } from '~/lib/auth';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Home' }, { name: 'description', content: 'Neo Bank' }];
}

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/signin', { replace: true });
    }
  }, [navigate]);

  return null;
}
