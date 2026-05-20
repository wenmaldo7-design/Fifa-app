import {
  Component,
  inject,
  Output,
  EventEmitter,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-player',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],

  templateUrl: './create-player.html',

  styleUrl: './create-player.scss',
})
export class CreatePlayer {
  private fb = inject(FormBuilder);

  private http = inject(HttpClient);

  @Output()
  playerCreated = new EventEmitter();

  form = this.fb.group({
    name: [
      '',
      Validators.required,
    ],

    club: [
      '',
      Validators.required,
    ],

    nationality: [
      '',
      Validators.required,
    ],

    position: [
      '',
      Validators.required,
    ],

    overall: [
      50,
      Validators.required,
    ],

    pace: [50],

    shooting: [50],

    passing: [50],

    dribbling: [50],

    defending: [50],

    physical: [50],
  });

  createPlayer() {
    const token =
      localStorage.getItem('token');

    const values = this.form.value;

    const playerData = {
      short_name: values.name,

      club_name: values.club,

      nationality_name:
        values.nationality,

      player_positions:
        values.position,

      overall: values.overall,

      pace: values.pace,

      shooting: values.shooting,

      passing: values.passing,

      dribbling: values.dribbling,

      defending: values.defending,

      physic: values.physical,

      fifa_version: 23,
    };

    this.http
      .post(
        'http://localhost:3000/players',

        playerData,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .subscribe({
        next: () => {
          alert(
            'Jugador creado correctamente',
          );

          this.playerCreated.emit();

          this.form.reset();
        },

        error: (error) => {
          console.error(error);
        },
      });
  }
}