import { Component, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,

  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [CommonModule],
})
export class AppComponent implements OnInit {
  todos = signal<Todo[]>([]);
  http = inject(HttpClient);

  ngOnInit(): void {
    this.http.get<Todo[]>(`http://localhost:3000/todos`).subscribe((res) => {
      this.todos.set(res);
    });
  }

  totalCompleted = computed(
    () => this.todos().filter((t) => t.completed).length
  );
  totalTodos = computed(() => this.todos().filter((t) => !t.completed).length);

  removeTodo(todoToRemove: Todo) {
    this.http
      .delete(`http://localhost:3000/todos/${todoToRemove.id}`)
      .subscribe(() => {
        this.todos.update((todos) =>
          todos.filter((todo) => todo.id !== todoToRemove.id)
        );
      });
  }

  addTodo(input: HTMLInputElement) {
    this.http
      .post<Todo>(`http://localhost:3000/todos`, {
        title: input.value,
        completed: false,
      })
      .subscribe((newTodo) => {
        this.todos.update((todos) => [...todos, newTodo]);
        input.value = '';
      });
  }

  toggleTodo(todoToToggle: Todo) {
    this.http
      .patch<Todo>(`http://localhost:3000/todos/${todoToToggle.id}`, {
        ...todoToToggle,
        completed: !todoToToggle.completed,
      })
      .subscribe((res) => {
        this.todos.update((todos) => {
          return todos.map((t) => (t.id === todoToToggle.id ? res : t));
        });
      });
  }
}

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}
