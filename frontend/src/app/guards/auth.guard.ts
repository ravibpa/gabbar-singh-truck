import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to initialize
  await new Promise<void>(resolve => {
    if (!auth.loading()) {
      resolve();
      return;
    }
    const interval = setInterval(() => {
      if (!auth.loading()) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/admin/login'], {
    queryParams: { returnUrl: state.url }
  });
};
