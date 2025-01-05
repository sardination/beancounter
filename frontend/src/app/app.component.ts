import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ComponentFactoryResolver,
  isDevMode,
  HostListener,
} from '@angular/core';

import { PageDirective } from './pages/page.directive';
import { PriorInventoryPageComponent } from './pages/prior-inventory-page/prior-inventory-page.component';
import { CurrentJobPageComponent } from './pages/current-job-page/current-job-page.component';
import { DailyTransactionsPageComponent } from './pages/daily-transactions-page/daily-transactions-page.component';
import { MonthlyReviewPageComponent } from './pages/monthly-review-page/monthly-review-page.component';
import { FIProjectionPageComponent } from './pages/fi-projection-page/fi-projection-page.component';
import { NetWorthPageComponent } from './pages/net-worth-page/net-worth-page.component';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title: string = 'Bean Counter';
  version: string = 'DEV';
  currentPath: string = "/";
  availablePages: Map<string, any> = new Map<string, any>(); // key by path to component value

  @ViewChild(PageDirective) pageHost: PageDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
      this.availablePages.set("prior-inventory", PriorInventoryPageComponent);
      this.availablePages.set("current-job", CurrentJobPageComponent);
      this.availablePages.set("daily-transactions", DailyTransactionsPageComponent);
      this.availablePages.set("monthly-review", MonthlyReviewPageComponent);
      this.availablePages.set("net-worth", NetWorthPageComponent);
      this.availablePages.set("fi-projection", FIProjectionPageComponent);
  }

  @HostListener('window:pywebviewready', ['$event'])
  webviewReadyEvent(event: any) {
    setTimeout(() => {
      window.pywebview.api.resize(window.screen.width, window.screen.height);
      // TODO: modify this so that dev also has versions?
      if (!isDevMode()) {
        window.pywebview.api.get_version().then(
          (version) => {this.version = version;}
        );
      }
      this.loadPage(this.currentPath);
    });
  }

  normalizePath(path: string): string {
    /*
        Provide the appropriate path name by removing superfluous characters
    */

    if (path.length > 0 && path.charAt(0) === "/") {
        path = path.substring(1, path.length);
    }

    // if the request path is index then default to daily-transactions
    if (path == "") {
        path = "daily-transactions";
    }

    return path;
  }

  loadPage(path: string): void {
    /*
        Load page component into view given path
    */
    path = this.normalizePath(path);

    const component = this.availablePages.get(path);
    if (!component) {
        return;
    }

    this.currentPath = path;
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);

    const viewContainerRef = this.pageHost.viewContainerRef;
    viewContainerRef.clear();

    viewContainerRef.createComponent<Component>(componentFactory);
  }

  activePage(path: string): string {
      /*
          Return the class name 'active' if the given path is currently
          active, and '' otherwise
      */
      path = this.normalizePath(path);

      if (path == this.currentPath) {
          return "active";
      }

      return "";
  }
}
