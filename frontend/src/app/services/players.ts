import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PlayersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/players`;

  private get headers() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getPlayers(page = 1, limit = 20, name = '', club = '', position = '', gender = 'M', nationality = '') {
    const params = `page=${page}&limit=${limit}&name=${name}&club=${club}&position=${position}&nationality=${nationality}&gender=${gender}&t=${Date.now()}`;
    return this.http.get(`${this.apiUrl}?${params}`, { headers: this.headers });
  }

  getPlayer(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  createPlayer(player: object) {
    return this.http.post(this.apiUrl, player, { headers: this.headers });
  }

  updatePlayer(id: number, player: object) {
    return this.http.put(`${this.apiUrl}/${id}`, player, { headers: this.headers });
  }

  deletePlayer(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  exportCsv(name = '', club = '', position = '', gender = 'M', nationality = '') {
    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (club) params.set('club', club);
    if (position) params.set('position', position);
    if (nationality) params.set('nationality', nationality);
    params.set('gender', gender);
    return this.http.get(`${this.apiUrl}/export/csv?${params}`, {
      headers: this.headers,
      responseType: 'blob',
    });
  }

  getTimeline(name: string, gender = 'M') {
    return this.http.get(`${this.apiUrl}/timeline/search?name=${name}&gender=${gender}&t=${Date.now()}`, {
      headers: this.headers,
    });
  }

  analyzeTimeline(history: object[], gender = 'M') {
    return this.http.post(`${this.apiUrl}/timeline/analyze`, { history, gender }, { headers: this.headers });
  }
}
