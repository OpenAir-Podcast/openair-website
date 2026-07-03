import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Download } from './pages/download/download';
import { Blog } from './pages/blog/blog';
import { Contribute } from './pages/contribute/contribute';
import { Documentation } from './pages/documentation/documentation';
import { Privacy } from './pages/privacy/privacy';
import { VerifyRecovery } from './pages/verify-recovery/verify-recovery';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: About },
  { path: 'download', component: Download },
  { path: 'blog', component: Blog },
  { path: 'contribute', component: Contribute },
  { path: 'documentation', component: Documentation },
  { path: 'privacy', component: Privacy },
  { path: 'verify-recovery', component: VerifyRecovery },
  { path: '**', redirectTo: '' }
];
