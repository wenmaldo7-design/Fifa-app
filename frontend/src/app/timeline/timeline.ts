import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayersService } from '../services/players';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
})
export class Timeline {
  private playersService = inject(PlayersService);
  private cdr = inject(ChangeDetectorRef);

  searchName = '';
  players: any[] = [];
  selectedSkill = 'pace';
  loading = false;
  error = '';
  analysis = '';
  loadingAnalysis = false;
  analysisError = '';

  skills = [
    { key: 'pace', label: 'Pace' },
    { key: 'shooting', label: 'Shooting' },
    { key: 'passing', label: 'Passing' },
    { key: 'dribbling', label: 'Dribbling' },
    { key: 'defending', label: 'Defending' },
    { key: 'physic', label: 'Physic' },
    { key: 'overall', label: 'Overall' },
  ];

  search() {
    if (!this.searchName.trim()) return;

    this.loading = true;
    this.error = '';
    this.players = [];
    this.analysis = '';
    this.analysisError = '';

    this.playersService.getTimeline(this.searchName).subscribe({
      next: (data: any) => {
        this.players = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('TIMELINE ERROR:', err);
        this.error = 'No se encontraron resultados';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  analyze() {
    if (!this.players.length) return;

    this.loadingAnalysis = true;
    this.analysis = '';
    this.analysisError = '';

    const history = this.players.map((p) => ({
      fifa_version: p.fifa_version,
      pace: p.pace,
      shooting: p.shooting,
      passing: p.passing,
      dribbling: p.dribbling,
      defending: p.defending,
      physic: p.physic,
      overall: p.overall,
    }));

    this.playersService.analyzeTimeline(history).subscribe({
      next: (data: any) => {
        this.analysis = data.analysis;
        this.loadingAnalysis = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.analysisError = 'Error al analizar con IA. Verificá que GROQ_API_KEY esté configurada.';
        this.loadingAnalysis = false;
        this.cdr.detectChanges();
      },
    });
  }
}