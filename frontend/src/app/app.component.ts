// import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  // constructor(private overlayContainer: OverlayContainer) {}

  ngOnInit() {
  //   const overlayContainerElement = this.overlayContainer.getContainerElement();
  //   document.body.appendChild(overlayContainerElement); // Ensure it's a direct child of the body
  }
}
