import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { createApp, App } from 'vue';

@Directive({
  selector: '[vueComponent]',
  standalone: true
})
export class VueComponentDirective implements OnInit, OnDestroy {
  @Input('vueComponent') component: any;
  private vueApp!: App;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.vueApp = createApp(this.component);
    this.vueApp.mount(this.el.nativeElement);
  }

  ngOnDestroy() {

    if (this.vueApp) {
      this.vueApp.unmount();
    }
  }
}