import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { PlayersService } from './services/players';
import { Login } from './login/login';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, Login],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private playersService = inject(PlayersService);

  players = signal<any[]>([]);
  total = signal(0);
  loading = signal(false);
  selectedPlayer: any = null;
  chart: any;
  isLoggedIn = false;
  darkMode = false;
  editingPlayer = false;
  editError = '';
  name = '';
  club = '';
  position = '';
  gender = 'M';
  page = 1;
  limit = 20;
  activeTab = 'info';
  timeline: any[] = [];
  loadingTimeline = false;
  timelineError = '';
  analysis = signal('');
  loadingAnalysis = signal(false);
  analysisError = signal('');
  downloadingCsv = signal(false);
  showCreateForm = false;
  createError = '';
  newPlayer = {
    short_name: '', club_name: '', nationality_name: '',
    player_positions: '', overall: 80, pace: 70, shooting: 70,
    passing: 70, dribbling: 70, defending: 50, physic: 70, fifa_version: 23, gender: 'M',
  };

  get totalPages() {
    return Math.ceil(this.total() / this.limit) || 0;
  }

  get pageRange(): number[] {
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, this.page + 2);
    const range: number[] = [];
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('token')) {
        this.isLoggedIn = true;
        this.loadPlayers();
      }
      if (localStorage.getItem('darkMode') === 'true') {
        this.darkMode = true;
        document.body.classList.add('dark');
      }
    }
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark', this.darkMode);
    localStorage.setItem('darkMode', String(this.darkMode));
  }

  onLogin() {
    this.isLoggedIn = true;
    this.loadPlayers();
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.players.set([]);
    this.selectedPlayer = null;
  }

  search() {
    this.page = 1;
    this.loadPlayers();
  }

  loadPlayers() {
    this.loading.set(true);
    this.playersService.getPlayers(this.page, this.limit, this.name, this.club, this.position, this.gender)
      .subscribe({
        next: (response: any) => {
          this.players.set(response.rows || []);
          this.total.set(response.count || 0);
          this.loading.set(false);
        },
        error: (err: any) => {
          console.error(err);
          this.loading.set(false);
        },
      });
  }

  goTo(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.loadPlayers();
  }

  showPlayer(player: any) {
    this.selectedPlayer = player;
    this.activeTab = 'info';
    this.timeline = [];
    this.analysis.set('');
    this.analysisError.set('');
    this.timelineError = '';
    this.loadTimeline(player.short_name);
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'skills') {
      requestAnimationFrame(() => requestAnimationFrame(() => this.createChart()));
    }
  }

  setGender(g: string) {
    if (this.gender === g) return;
    this.gender = g;
    this.page = 1;
    this.loadPlayers();
  }

  loadTimeline(name: string) {
    this.loadingTimeline = true;
    this.playersService.getTimeline(name, this.gender).subscribe({
      next: (data: any) => {
        this.timeline = data;
        this.loadingTimeline = false;
      },
      error: () => {
        this.timelineError = 'No se pudo cargar el historial';
        this.loadingTimeline = false;
      },
    });
  }

  analyze() {
    if (!this.timeline.length) return;
    this.loadingAnalysis.set(true);
    this.analysis.set('');
    this.analysisError.set('');

    const history = this.timeline.map((p: any) => ({
      fifa_version: p.fifa_version,
      pace: p.pace,
      shooting: p.shooting,
      passing: p.passing,
      dribbling: p.dribbling,
      defending: p.defending,
      physic: p.physic,
      overall: p.overall,
    }));

    this.playersService.analyzeTimeline(history, this.gender).subscribe({
      next: (data: any) => {
        this.analysis.set(data.analysis);
        this.loadingAnalysis.set(false);
      },
      error: () => {
        this.analysisError.set('Error al analizar con IA.');
        this.loadingAnalysis.set(false);
      },
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.selectedPlayer) this.closeModal();
    else if (this.showCreateForm) this.closeCreateForm();
  }

  closeModal() {
    this.selectedPlayer = null;
    this.editingPlayer = false;
    this.activeTab = 'info';
    this.timeline = [];
    this.analysis.set('');
    this.analysisError.set('');
    if (this.chart) this.chart.destroy();
  }

  openCreateForm() {
    this.newPlayer = {
      short_name: '', club_name: '', nationality_name: '',
      player_positions: '', overall: 80, pace: 70, shooting: 70,
      passing: 70, dribbling: 70, defending: 50, physic: 70, fifa_version: 23, gender: 'M',
    };
    this.createError = '';
    this.showCreateForm = true;
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.createError = '';
  }

  createPlayer() {
    this.createError = '';
    const p = this.newPlayer;

    if (!p.short_name || !p.club_name || !p.nationality_name || !p.player_positions) {
      this.createError = 'Nombre, club, nacionalidad y posición son obligatorios';
      return;
    }
    if (p.overall < 1 || p.overall > 100) {
      this.createError = 'Overall debe estar entre 1 y 100';
      return;
    }

    this.playersService.createPlayer(p).subscribe({
      next: () => {
        this.closeCreateForm();
        this.loadPlayers();
      },
      error: (err: any) => {
        this.createError = err?.error?.message || 'Error al crear el jugador';
      },
    });
  }

  enableEdit() {
    this.editingPlayer = true;
  }

  savePlayer() {
    this.editError = '';

    if (!this.selectedPlayer.club_name || !this.selectedPlayer.nationality_name || !this.selectedPlayer.player_positions) {
      this.editError = 'Todos los campos son obligatorios';
      return;
    }
    if (this.selectedPlayer.overall < 1 || this.selectedPlayer.overall > 100) {
      this.editError = 'Overall debe estar entre 1 y 100';
      return;
    }

    this.playersService.updatePlayer(this.selectedPlayer.id, this.selectedPlayer).subscribe({
      next: () => {
        this.editingPlayer = false;
        this.loadPlayers();
      },
      error: (err: any) => {
        console.error(err);
        if (err.status === 401) this.logout();
      },
    });
  }

  deletePlayer() {
    if (!confirm('¿Eliminar jugador?')) return;

    this.playersService.deletePlayer(this.selectedPlayer.id).subscribe({
      next: () => {
        this.closeModal();
        this.loadPlayers();
      },
      error: (err: any) => console.error(err),
    });
  }

  downloadCsv() {
    if (this.downloadingCsv()) return;
    this.downloadingCsv.set(true);

    this.playersService.exportCsv(this.name, this.club, this.position, this.gender).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'players.csv';
        a.click();
        URL.revokeObjectURL(url);
        this.downloadingCsv.set(false);
      },
      error: (err: any) => {
        console.error('Error descargando CSV', err);
        this.downloadingCsv.set(false);
      },
    });
  }

  overallClass(overall: number): string {
    if (overall >= 90) return 'overall-gold';
    if (overall >= 80) return 'overall-green';
    if (overall >= 70) return 'overall-blue';
    return 'overall-gray';
  }

  positionClass(pos: string): string {
    if (!pos) return 'pos-default';
    const p = pos.toUpperCase();
    if (p.includes('GK')) return 'pos-gk';
    if (p.includes('CB') || p.includes('LB') || p.includes('RB') || p.includes('WB')) return 'pos-def';
    if (p.includes('CDM') || p.includes('CM') || p.includes('CAM') || p.includes('LM') || p.includes('RM')) return 'pos-mid';
    if (p.includes('LW') || p.includes('RW') || p.includes('CF') || p.includes('ST')) return 'pos-att';
    return 'pos-default';
  }

  createChart() {
    const canvas: any = document.getElementById('skillsChart');
    if (!canvas) return;

    if (this.chart) this.chart.destroy();

    const stats = [
      this.selectedPlayer.pace,
      this.selectedPlayer.shooting,
      this.selectedPlayer.passing,
      this.selectedPlayer.dribbling,
      this.selectedPlayer.defending,
      this.selectedPlayer.physic,
    ];

    const pointColors = stats.map(v => {
      if (v >= 85) return '#22c55e';
      if (v >= 70) return '#3b82f6';
      if (v >= 55) return '#f59e0b';
      return '#ef4444';
    });

    const labelColor = this.darkMode ? '#94a3b8' : '#1e1b4b';
    const gridColor  = this.darkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.2)';

    this.chart = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physic'],
        datasets: [{
          label: this.selectedPlayer.short_name,
          data: stats,
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          borderColor: 'rgba(99, 102, 241, 0.8)',
          borderWidth: 2,
          pointBackgroundColor: pointColors,
          pointBorderColor: pointColors,
          pointRadius: 6,
          pointHoverRadius: 8,
        }],
      },
      options: {
        responsive: true,
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false },
            grid: { color: gridColor },
            angleLines: { color: gridColor },
            pointLabels: {
              color: labelColor,
              font: { size: 12, weight: 'bold' },
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${ctx.label}: ${ctx.raw}`,
            },
          },
        },
      },
    });
  }
}
