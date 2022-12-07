import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { Hero } from '../hero';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero-search',
  templateUrl: './hero-search.component.html',
  styleUrls: ['./hero-search.component.css'],
})
export class HeroSearchComponent implements OnInit {
  heroes$!: Observable<Hero[]>;
  private searchTerms = new Subject<string>();

  constructor(private heroService: HeroService) {}

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.heroes$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => this.heroService.searchHeroes(term))
    );
  }
}

/**
 * Remember that the component class doesn't subscribe to the heroes$ observable. That's the job of the AsyncPipe in the template.
 
 * heroes$!: Observable<Hero[]>;

 - the declaration of heroes$ as an Observable
 
 * The searchTerms RxJS subject - 
 private searchTerms = new Subject<string>();

 - A Subject is both a source of observable values and an Observable itself. 
 - You can subscribe to a Subject as you would any Observable.
 - You can also push values into that Observable by calling its next(value) method as the search() method does. -> this.searchTerms.next(term);
 - The event binding to the text box's input event calls the search() method. -> <input #searchBox id="search-box" (input)="search(searchBox.value)" />
 - Every time the user types in the text box, the binding calls search() with the text box value as a search term.
 - The searchTerms becomes an Observable emitting a steady stream of search terms.

 * Chaining RxJS operators

 - Passing a new search term directly to the searchHeroes() after every user keystroke creates excessive HTTP requests, which taxes server resources and burning through data plans.
 - Instead, the ngOnInit() method pipes the searchTerms observable through a sequence of RxJS operators that reduce the number of calls to the searchHeroes().
 - Ultimately, this returns an observable of timely hero search results where each one is a Hero[].
 - Each operator works as follows:
    - debounceTime(300) -> waits until the flow of new string events pauses for 300 milliseconds before passing along the latest string. Requests aren't likely to happen more frequently than 300 ms.
    - distinctUntilChanged() -> ensures that a request is sent only if the filter text changed.
    - switchMap() -> calls the search service for each search term that makes it through debounce() and distinctUntilChanged(). It cancels and discards previous search observables, returning only the latest search service observable.
 */
