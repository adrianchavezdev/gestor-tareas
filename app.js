// Clase que representa una tarea
class Tarea {
  constructor(nombre, completa = false, id = Date.now() + Math.random()) {
    this.id = id;
    this.nombre = nombre;
    this.completa = completa;
    this.eliminada = false;
  }
  actualizarEstado() { this.completa = !this.completa; }
  editar(nuevoNombre) { this.nombre = nuevoNombre; }
  eliminar() { this.eliminada = true; }
}

// Clase que gestiona la lista de tareas y el almacenamiento
class GestorDeTareas {
  constructor() {
    this.tareas = [];
    this.cargar();
  }
  agregar(nombre) {
    this.tareas.push(new Tarea(nombre));
    this.guardar();
  }
  buscar(id) { return this.tareas.find(t => t.id === id); }
  editar(id, nuevoNombre) {
    this.buscar(id)?.editar(nuevoNombre);
    this.guardar();
  }
  alternar(id) {
    this.buscar(id)?.actualizarEstado();
    this.guardar();
  }
  eliminar(id) {
    this.buscar(id)?.eliminar();
    this.tareas = this.tareas.filter(t => !t.eliminada);
    this.guardar();
  }
  guardar() { localStorage.setItem('tareas', JSON.stringify(this.tareas)); }
  cargar() {
    const datos = JSON.parse(localStorage.getItem('tareas')) || [];
    this.tareas = datos.map(d => new Tarea(d.nombre, d.completa, d.id));
  }
}

// Referencias al DOM
const gestor = new GestorDeTareas();
const input = document.getElementById('inputTarea');
const btnAgregar = document.getElementById('btnAgregar');
const lista = document.getElementById('listaTareas');
const mensajeError = document.getElementById('mensajeError');

const mostrarTareas = () => {
  lista.innerHTML = '';
  gestor.tareas.forEach(tarea => {
    const li = document.createElement('li');
    li.className = tarea.completa ? 'completa' : '';
    li.innerHTML = `
      <span class="texto"></span>
      <div class="acciones">
        <button class="btn-editar">Editar</button>
        <button class="btn-eliminar">Eliminar</button>
      </div>`;
    li.querySelector('.texto').textContent = tarea.nombre; // evita inyección de HTML
    li.querySelector('.texto').addEventListener('click', () => { gestor.alternar(tarea.id); mostrarTareas(); });
    li.querySelector('.btn-editar').addEventListener('click', () => {
      const nuevo = prompt('Editar tarea:', tarea.nombre);
      if (nuevo === null) return;
      if (nuevo.trim() === '') { mostrarError('El nombre de la tarea no puede estar vacío.'); return; }
      gestor.editar(tarea.id, nuevo.trim());
      mostrarError('');
      mostrarTareas();
    });
    li.querySelector('.btn-eliminar').addEventListener('click', () => { gestor.eliminar(tarea.id); mostrarTareas(); });
    lista.appendChild(li);
  });
};

const mostrarError = (msg) => { mensajeError.textContent = msg; };

const agregarTarea = () => {
  const nombre = input.value.trim();
  if (nombre === '') { mostrarError('Por favor escribe una tarea antes de agregar.'); return; }
  gestor.agregar(nombre);
  input.value = '';
  mostrarError('');
  mostrarTareas();
};

btnAgregar.addEventListener('click', agregarTarea);
input.addEventListener('keydown', e => { if (e.key === 'Enter') agregarTarea(); });

mostrarTareas();
