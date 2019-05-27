import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingPageComponent } from './components';
import { LandingpageGuard } from './services';

const routes: Routes = [
  {
    path: '', component: LandingPageComponent, canActivate: [LandingpageGuard],
    data: { telemetry: { env: 'public', pageid: 'landing-page', type: 'edit', subtype: 'paginate' } }
  },
  {
    path: 'explore', loadChildren: './module/explore/explore.module#ExploreModule'
  },
  {
    path: 'explore-library', loadChildren: './module/library-content/library-content.module#LibraryContentModule'
  },
  {
    path: ':slug/explore-library', loadChildren: './module/library-content/library-content.module#LibraryContentModule'

  },
  {
    path: ':slug/explore', loadChildren: './module/explore/explore.module#ExploreModule'
  },
  {
    path: 'explore-courses', loadChildren: './module/course/course.module#CourseModule'
  },
  {
    path: ':slug/explore-courses', loadChildren: './module/course/course.module#CourseModule'
  },
  {
    path: ':slug/signup', loadChildren: './module/signup/signup.module#SignupModule'
  },
  {
    path: 'signup', loadChildren: './module/signup/signup.module#SignupModule'
  },
  {
    path: ':slug/sign-in/sso', loadChildren: './module/sign-in/sso/sso.module#SsoModule'
  },
  {
    path: 'sign-in/sso', loadChildren: './module/sign-in/sso/sso.module#SsoModule'
  },
  {
    path: 'play', loadChildren: './module/player/player.module#PlayerModule'
  }];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
