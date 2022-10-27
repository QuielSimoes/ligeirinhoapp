import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'consulta-protocolo',
    loadChildren: () => import('./consulta-protocolo/consulta-protocolo.module').then( m => m.ConsultaProtocoloPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'retorno-ar',
    loadChildren: () => import('./retorno-ar/retorno-ar.module').then( m => m.RetornoArPageModule)
  },
  {
    path: 'final',
    loadChildren: () => import('./final/final.module').then( m => m.FinalPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
