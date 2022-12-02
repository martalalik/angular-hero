import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Hero } from './hero';
// import { HEROES } from './mock-heroes';
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
    return this.http.get<Hero[]>(this.heroesUrl).pipe(
      tap((_) => this.log('fetched heroes')),
      catchError(this.handleError<Hero[]>('getHeroes', []))
    );
  }

  /**
    - Instead of handling the error directly, it returns an error handler function to catchError. This function is configured with both the name of the operation that failed and a safe return value.
    - Handle Http operation that failed.
    - Let the app continue.
    - @param operation - name of the operation that failed
    - @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** GET hero by id. Will 404 if id not found */
  getHero(id: number): Observable<Hero> {
    // For now, assume that a hero with the specified `id` always exists.
    // Error handling will be added in the next step of the tutorial.
    // const hero = HEROES.find((h) => h.id === id)!;
    // this.messageService.add(`HeroService: fetched hero id=${id}`);
    // return of(hero);

    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap((_) => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
      /**
       getHero() has three significant differences from getHeroes():
       - getHero() constructs a request URL with the desired hero's id
       - The server should respond with a single hero rather than an array of heroes
       - getHero() returns an Observable<Hero>, which is an observable of Hero objects rather than an observable of Hero arrays.
       */
    );
  }

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  /** PUT: update the hero on the server */
  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((_) => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
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

  Tap into the Observable

  - The HeroService methods taps into the flow of observable values and send a message, using the log() method, to the message area at the bottom of the page.
  - The RxJS tap() operator enables this ability by looking at the observable values, doing something with those values, and passing them along.
  - The tap() call back doesn't access the values themselves.

  updateHero

  - The HttpClient.put() method takes three parameters:
    - The URL
    - The data to update, which is the modified hero in this case
    - Options
  - The URL is unchanged. The heroes web API knows which hero to update by looking at the hero's id.
  - The heroes web API expects a special header in HTTP save requests. That header is in the httpOptions constant defined in the HeroService.
*/
