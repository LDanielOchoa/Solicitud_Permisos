import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Este middleware se ejecuta en cada solicitud
export function middleware(request: NextRequest) {
  // Obtiene la ruta actual
  const path = request.nextUrl.pathname;

  // Si la ruta es diferente a la raíz ('/'), redirige a la raíz
  if (path !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si la ruta es la raíz, permite que continúe normalmente
  return NextResponse.next();
}

// Configuración para que el middleware se ejecute en todas las rutas
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
