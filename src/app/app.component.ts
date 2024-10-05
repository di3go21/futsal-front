import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {


  constructor(private http: HttpClient) {
  }


  title = 'futsal-front';

  accionSeleccionada = {};

  //on init
  ngOnInit() {
    // this.actualizarCancha();
  }

  jugadoresConvocados = [
    {nombre: 'Aitor', numero: 1},
    {nombre: 'Peru', numero: 21},
    {nombre: 'Ochoa', numero: 7},
    {nombre: 'Christian', numero: 11},
    {nombre: 'Mini', numero: 3},
    {nombre: 'Adrián', numero: 77},
    {nombre: 'Mario', numero: 4},
    {nombre: 'Javi R.', numero: 5},
    {nombre: 'Raúl', numero: 12},
    {nombre: 'Rubi', numero: 10},
    {nombre: 'Galin', numero: 2},
    {nombre: 'Borja', numero: 15},
    {nombre: 'Dagon', numero: 28},
    {nombre: 'Aparicio', numero: 99},
    {nombre: 'Alf', numero: 8},
    {nombre: 'Cuñao', numero: 98},
    {nombre: 'Pratsquez', numero: 13}
  ];

  acciones = [
    {value: "GOL", label: "Gol"},
    {value: "ASISTENCIA", label: "Asistencia"},
    {value: "ROJA", label: "Roja"},
    {value: "AMARILLA", label: "Amarilla"},
    {value: "MORADA", label: "Morada"},
    {value: "CAMBIO", label: "Cambio"},
    {value: "PARADA_DESTACABLE", label: "Parada destacable"},
    {value: "CHINADA_DESTACABLE", label: "Chinada destacable"},
    {value: "GOL_EN_PROPIA", label: "Gol en propia"},
    {value: "GOL_EN_CONTRA", label: "Gol en contra"},
  ]

  jugadoresEnCancha = this.jugadoresConvocados.slice(0, 5);  // Los primeros 5 en cancha
  jugadoresEnBanquillo = this.jugadoresConvocados.slice(5); // El resto en el banquillo

  dorsalAccion = null;
  dorsalCambioEntrante = null;

  displayCambios = 'none';

  cargarBanquillo() {
    this.displayCambios = 'block';
  }

  showIniciarReloj = "block"
  showPausar = "none"

  tiempo = 0;
  temporizador = 0;
  tiempoFormateado = "00:00";
  jugadorNuevo = "";

  getFormattedTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60); // Calcula los minutos
    const remainingSeconds = Math.floor(seconds % 60); // Calcula los segundos restantes

    return `${this.padZero(minutes)}:${this.padZero(remainingSeconds)}`; // Formatea como mm:ss:decimas
  }

  padZero(value: number): string {
    return value < 10 ? '0' + value : value.toString(); // Añade un cero inicial si es menor que 10
  }

  iniciarTemporizador() {
    this.temporizador = setInterval(() => {
      this.tiempo++;
      this.tiempoFormateado = this.getFormattedTime(this.tiempo);
    }, 1000);
    this.showIniciarReloj = "none"
    this.showPausar = "block";

    let peti = {
      accion: "EMPIEZA",
      userId: this.getUserId()
    }

    this.http.post('/notificar/cambio', peti).subscribe(
      {
        next: (v) => console.log(v),
        error: (e) => console.error(e),
        complete: () => console.info('complete')
      }
    );
  }

  accionesDisplauValue = 'none';

  // Añadir eventos de clic a los jugadores para seleccionar acción
  clicJugador(numero: any) {
    this.dorsalAccion = numero;
    this.accionesDisplauValue = 'block'; // Mostrar menú de acciones
  };

  confirmarAccion() {
    if (this.dorsalAccion && this.accionSeleccionada) {
      if (this.accionSeleccionada === 'CAMBIO') {
        this.cargarBanquillo();
      } else {
        this.registrarAccion();
      }
      this.accionesDisplauValue = 'none';
    }
  }

  registrarAccion() {
    console.log(`Dorsal: ${this.dorsalAccion}, Acción: ${this.accionSeleccionada}`);
    if (this.dorsalCambioEntrante) {
      console.log(`Dorsal cambio entrante: ${this.dorsalCambioEntrante}`);
    }
    console.log(this.tiempoFormateado);

    //localstorage


    let peti = {
      dorsal: this.dorsalAccion,
      dorsalEntrada: this.jugadorNuevo,
      accion: this.accionSeleccionada,
      tiempo: this.tiempoFormateado,
      userId: this.getUserId()
    }
    this.http.post('/notificar/cambio', peti).subscribe(
      {
        next: (v) => console.log(v),
        error: (e) => console.error(e),
        complete: () => console.info('complete')
      }
    );

    this.jugadorNuevo="";
    this.dorsalAccion = null;
    this.dorsalCambioEntrante = null;
  }

  getUserId(){
    let item = localStorage.getItem("userId_futsal");
    if(!item){
      let id = Math.random().toString(36).substring(4);
      localStorage.setItem("userId_futsal", id);
    }
    return localStorage.getItem("userId_futsal");

  }
  confirmarCambio() {

    let numberAccion = Number(this.dorsalAccion)//sale numero
    let numberJugadorEntrante = Number(this.jugadorNuevo)//entra numero

    let jugadorEntrante = this.jugadoresEnBanquillo.filter(jugador => jugador.numero === numberJugadorEntrante)[0];
    this.jugadoresEnBanquillo = this.jugadoresEnBanquillo.filter(jugador => jugador.numero !== numberJugadorEntrante)
    let filtered = this.jugadoresConvocados.filter(jugador => jugador.numero === numberAccion);
    this.jugadoresEnBanquillo.push(filtered[0]);

    let indexSaliente = this.jugadoresEnCancha.findIndex(jug => jug.numero === numberAccion);

    this.jugadoresEnCancha[indexSaliente] = jugadorEntrante;

    this.displayCambios = 'none';

    this.registrarAccion()
  }

  pausarTemporizador() {
    this.textoIniciar = "Reanudar Partido"
    clearInterval(this.temporizador);
    this.showIniciarReloj = "block"
    this.showPausar = "none";

    let peti = {
      accion: "PAUSA",
      userId: this.getUserId()
    }

    this.http.post('/notificar/cambio', peti).subscribe(
      {
        next: (v) => console.log(v),
        error: (e) => console.error(e),
        complete: () => console.info('complete')
      }
    );
  }

  textoIniciar = "Iniciar Partido"

}
