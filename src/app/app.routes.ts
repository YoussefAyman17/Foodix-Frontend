import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Menu } from './components/menu/menu';

export const routes: Routes = [

    {path:'',component:Home,title:'Home'},
    {path:'menu',component:Menu,title:'menu'}

];
