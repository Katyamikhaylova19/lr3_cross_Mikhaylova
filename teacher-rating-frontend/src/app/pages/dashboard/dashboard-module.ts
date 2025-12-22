import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { DASHBOARD_ROUTES } from './dashboard.routes';

@NgModule({
  declarations: [Dashboard],
  imports: [
    CommonModule,
    RouterModule.forChild(DASHBOARD_ROUTES)
  ]
})
export class DashboardModule { }