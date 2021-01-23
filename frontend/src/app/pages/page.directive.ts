import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[pageHost]',
})
export class PageDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}