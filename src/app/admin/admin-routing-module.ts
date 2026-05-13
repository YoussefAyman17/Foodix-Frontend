import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayout } from './components/admin-layout/admin-layout';
import { DashboardHome } from './pages/dashboard-home/dashboard-home';
import { ManageOrders } from './pages/manage-orders/manage-orders';
import { ManageMeals } from './pages/manage-meals/manage-meals';
import { ManageComplaints } from './pages/manage-complaints/manage-complaints';
import { ManageCategories } from './pages/manage-categories/manage-categories';
import { ManageWorkers } from './pages/manage-workers/manage-workers';

const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: DashboardHome },
      { path: 'categories', component: ManageCategories },
      { path: 'orders', component: ManageOrders },
      { path: 'meals', component: ManageMeals },
      { path: 'workers', component: ManageWorkers },
      { path: 'complaints', component: ManageComplaints },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
