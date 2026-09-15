import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DeliveryAddress, PlacePrediction } from '../models/client';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GooglePlacesService {
  private scriptLoadingPromise?: Promise<boolean>;
  private autocompleteService: any = null;
  private placesService: any = null;
  private geocoder: any = null;

  // Mock Dakar fallback places when Google Maps API key is placeholder or offline
  private fallbackDakarPlaces: PlacePrediction[] = [
    {
      placeId: 'sn-dakar-pointe',
      mainText: 'Point E',
      secondaryText: 'Dakar, Sénégal',
      description: 'Point E, Dakar, Sénégal'
    },
    {
      placeId: 'sn-dakar-plateau',
      mainText: 'Plateau',
      secondaryText: 'Dakar, Sénégal',
      description: 'Plateau, Dakar, Sénégal'
    },
    {
      placeId: 'sn-dakar-almadies',
      mainText: 'Almadies',
      secondaryText: 'Dakar, Sénégal',
      description: 'Route des Almadies, Dakar, Sénégal'
    },
    {
      placeId: 'sn-dakar-mermoz',
      mainText: 'Mermoz',
      secondaryText: 'Dakar, Sénégal',
      description: 'Mermoz Pyrotechnie, Dakar, Sénégal'
    },
    {
      placeId: 'sn-dakar-ngor',
      mainText: 'Ngor',
      secondaryText: 'Dakar, Sénégal',
      description: 'Village de Ngor, Dakar, Sénégal'
    },
    {
      placeId: 'sn-dakar-fann',
      mainText: 'Fann Residence',
      secondaryText: 'Dakar, Sénégal',
      description: 'Avenue Cheikh Anta Diop, Fann, Dakar, Sénégal'
    }
  ];

  constructor() {}

  /**
   * Dynamically loads Google Maps JavaScript SDK if not already loaded.
   */
  private loadGoogleScript(): Promise<boolean> {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      return Promise.resolve(true);
    }

    if (this.scriptLoadingPromise) {
      return this.scriptLoadingPromise;
    }

    this.scriptLoadingPromise = new Promise<boolean>((resolve) => {
      const apiKey = environment.googleMapsApiKey;
      if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
        // Fallback mode if API key is placeholder
        resolve(false);
        return;
      }

      const scriptId = 'google-maps-js-sdk';
      if (document.getElementById(scriptId)) {
        resolve(false);
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.head.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  /**
   * Queries place predictions from Google Places Autocomplete API restricted to Senegal / Dakar.
   */
  getPredictions(query: string): Observable<PlacePrediction[]> {
    const q = (query || '').trim();
    if (!q) {
      return of([]);
    }

    return from(
      this.loadGoogleScript().then((isLoaded) => {
        if (isLoaded && typeof google !== 'undefined' && google.maps && google.maps.places) {
          return new Promise<PlacePrediction[]>((resolve) => {
            if (!this.autocompleteService) {
              this.autocompleteService = new google.maps.places.AutocompleteService();
            }

            const request = {
              input: q,
              componentRestrictions: { country: 'sn' }, // Restrict to Senegal
              locationBias: {
                center: { lat: 14.6937, lng: -17.4441 }, // Dakar Lat/Lng
                radius: 30000 // 30km radius around Dakar
              }
            };

            this.autocompleteService.getPlacePredictions(
              request,
              (predictions: any[], status: any) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                  const results: PlacePrediction[] = predictions.map((p) => ({
                    placeId: p.place_id,
                    mainText: p.structured_formatting?.main_text || p.description,
                    secondaryText: p.structured_formatting?.secondary_text || 'Sénégal',
                    description: p.description
                  }));
                  resolve(results);
                } else {
                  resolve(this.filterFallbackPlaces(q));
                }
              }
            );
          });
        } else {
          // Graceful fallback filtering
          return this.filterFallbackPlaces(q);
        }
      })
    );
  }

  /**
   * Retrieves full place details (lat, lng, formatted address, city, country) for a selected place.
   */
  getPlaceDetails(prediction: PlacePrediction): Observable<DeliveryAddress> {
    return from(
      this.loadGoogleScript().then((isLoaded) => {
        if (isLoaded && typeof google !== 'undefined' && google.maps && google.maps.places) {
          return new Promise<DeliveryAddress>((resolve) => {
            if (!this.geocoder) {
              this.geocoder = new google.maps.Geocoder();
            }

            this.geocoder.geocode({ placeId: prediction.placeId }, (results: any[], status: any) => {
              if (status === 'OK' && results && results[0]) {
                const place = results[0];
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                
                let city = 'Dakar';
                let country = 'Sénégal';

                if (place.address_components) {
                  for (const comp of place.address_components) {
                    if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')) {
                      city = comp.long_name;
                    }
                    if (comp.types.includes('country')) {
                      country = comp.long_name;
                    }
                  }
                }

                resolve({
                  formattedAddress: place.formatted_address || prediction.description,
                  name: prediction.mainText,
                  latitude: lat,
                  longitude: lng,
                  placeId: prediction.placeId,
                  city: city,
                  country: country
                });
              } else {
                resolve(this.createFallbackAddress(prediction));
              }
            });
          });
        } else {
          return this.createFallbackAddress(prediction);
        }
      })
    );
  }

  private filterFallbackPlaces(query: string): PlacePrediction[] {
    const q = query.toLowerCase();
    return this.fallbackDakarPlaces.filter(
      (p) => p.mainText.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  private createFallbackAddress(prediction: PlacePrediction): DeliveryAddress {
    return {
      formattedAddress: prediction.description,
      name: prediction.mainText,
      latitude: 14.7006,
      longitude: -17.4572,
      placeId: prediction.placeId || 'mock-id-' + Date.now(),
      city: 'Dakar',
      country: 'Sénégal'
    };
  }
}
