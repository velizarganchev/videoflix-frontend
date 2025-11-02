import { Component } from '@angular/core';

/**
 * Loading Spinner component.
 *
 * A reusable visual indicator for loading states across the application.
 * Commonly displayed during HTTP requests, form submissions, or lazy-loaded views.
 *
 * Selector: `app-loading-spinner`
 * Standalone: `true`
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss'
})
export class LoadingSpinnerComponent { }
