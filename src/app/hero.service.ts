import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Hero } from './hero';
import { HEROES } from './mock-heroes';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  // This is an example of a typical service-in-service scenario in which you inject the MessageService into the HeroService which is injected into the HeroesComponent.
  constructor(
    private messageService: MessageService,
    private http: HttpClient
  ) {}

  // Log a HeroService message with the MessageService
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }

  private heroesUrl = 'api/heroes';

  // GET heroes from the mock data
  // getHeroes(): Observable<Hero[]> {
  //   const heroes = of(HEROES);
  //   this.messageService.add('HeroService: fetched heroes');
  //   return heroes;
  // }

  /** GET heroes from the server */
  getHeroes(): Observable<Hero[]> {
    this.messageService.add('HeroService: fetched heroes');
    return this.http
      .get<Hero[]>(this.heroesUrl)
      .pipe(catchError(this.handleError<Hero[]>('getHeroes', [])));
  }

  getHero(id: number): Observable<Hero> {
    // For now, assume that a hero with the specified `id` always exists.
    // Error handling will be added in the next step of the tutorial.
    const hero = HEROES.find((h) => h.id === id)!;
    this.messageService.add(`HeroService: fetched hero id=${id}`);
    return of(hero);
  }
}

/*
  You've swapped of() for http.get() and the application keeps working without any other changes because both functions return an Observable<Hero[]>.

  HttpClient methods return one value:

  - All HttpClient methods return an RxJS Observable of something.
  - In general, an observable can return more than one value over time. An observable from HttpClient always emits a single value and then completes, never to emit again.
  - This particular call to HttpClient.get() returns an Observable<Hero[]>, which is an observable of hero arrays. In practice, it only returns a single hero array.

  HttpClient.get() returns response data:

  - HttpClient.get() returns the body of the response as an untyped JSON object by default. Applying the optional type specifier, <Hero[]> , adds TypeScript capabilities, which reduce errors during compile time.
  - The server's data API determines the shape of the JSON data. The Tour of Heroes data API returns the hero data as an array.

  Error handling:

  - Things go wrong, especially when you're getting data from a remote server. The HeroService.getHeroes() method should catch errors and do something appropriate.
  - To catch errors, you "pipe" the observable result from http.get() through an RxJS catchError() operator.
  - The catchError() operator intercepts an Observable that failed. The operator then passes the error to the error handling function.
  - The following handleError() method reports the error and then returns an innocuous result so that the application keeps working.
*/
