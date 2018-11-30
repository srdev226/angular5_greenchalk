import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ViewEncapsulation } from '@angular/core';
import { SchoolDataService} from './management/school/school-data.service';
import { UserAccountDataService } from './user-account/user-account-data.service';
import { UserRoleDataService } from './user/user-role/user-role-data.service';
import { subMenu, sMenu } from './submenu';
declare var $:JQueryStatic;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './sidebar.component.css'],
   encapsulation: ViewEncapsulation.None
})

export class AppComponent {
  public isCollapsed = false;
  public curMenuTitle = "Home";
  title = 'Greenchalk Admin!';
  curMenuName = 'DASH';
  pulled = false;

	constructor(private router: Router,
              private location: Location,
              public schoolDataService: SchoolDataService,
              public userAccountDataService: UserAccountDataService,
              public userRoleDataService: UserRoleDataService) { }

	ngAfterViewInit() {
    let path = this.location.path();
    if(path.includes('/login/')){
      let institution_id = path.split('/')[2];
      this.router.navigate(['/login/'+institution_id]);
    }
    else{
	    this.router.navigate(['/login']);
    }
	}

  isLoggedIn() {
    return this.userRoleDataService.permissions && this.userRoleDataService.permissions.length > 0;
  }

  isMenuSelected(menuName) {
    return this.curMenuName == menuName;
  }

  isSmenuSelected(menuName: string) {
    return subMenu[menuName].indexOf(this.curMenuName) + 1;
  }

  onMenuSelect(menuName, menuTitle) {
    let smenuSel = 0;
    sMenu.forEach(function(menu) {
      if (subMenu[menu].indexOf(menuName) + 1)
        smenuSel = 1;
    });
    if (!smenuSel)
      ($('.collapse')).collapse('hide');
    this.curMenuTitle = menuTitle;
    this.curMenuName = menuName;
  }

  pullMenu() {
    this.pulled = true;
  }

  pushMenu() {
    this.pulled = false;
  }

  isPulled() {
    return this.pulled;
  }

	logout() {
     window.location.replace('/');
  }
}
